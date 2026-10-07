package middleware

import (
	"context"
	"strings"

	"github.com/gofiber/fiber/v2"

	"github.com/akbarandriansyah22/BackendProject_and_Portofolio/e-commerce-api/server/internal/models"
	"github.com/akbarandriansyah22/BackendProject_and_Portofolio/e-commerce-api/server/internal/observability"
	"github.com/akbarandriansyah22/BackendProject_and_Portofolio/e-commerce-api/server/internal/security"
)

// AuthUserLookup loads the current role and token version from the database.
type AuthUserLookup interface {
	GetByID(ctx context.Context, id int) (*models.User, error)
}

// ROLE CONSTANTS

const (
	RoleAdmin    = 1
	RoleCustomer = 2
)

// Auth middleware (JWT required)
func Auth(jwtSecret string, logger observability.Logger, users AuthUserLookup) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			logger.Warn("auth_failed: missing authorization header ip=%s", c.IP())
			return unauthorized(c, "Authorization header required")
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			logger.Warn("auth_failed: invalid auth header format ip=%s", c.IP())
			return unauthorized(c, "Invalid authorization header format")
		}

		tokenString := parts[1]

		claims, err := security.ParseToken(tokenString, jwtSecret)
		if err != nil {
			logger.Warn("auth_failed: invalid token ip=%s err=%v", c.IP(), err)
			return unauthorized(c, "Invalid or expired token")
		}

		user, err := users.GetByID(c.Context(), claims.UserID)
		if err != nil || user == nil || !user.IsActive || user.TokenVersion != claims.TokenVersion {
			logger.Warn("auth_failed: user rejected userID=%d ip=%s", claims.UserID, c.IP())
			return unauthorized(c, "Invalid or expired token")
		}

		// Role comes from the database, not the JWT claim.
		c.Locals("userID", user.ID)
		c.Locals("email", user.Email)
		c.Locals("roleID", user.RoleID)
		c.Locals("user", claims)

		logger.Info(
			"auth_success: userID=%d email=%s ip=%s",
			user.ID,
			user.Email,
			c.IP(),
		)

		return c.Next()
	}
}

func unauthorized(c *fiber.Ctx, message string) error {
	return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
		"success": false,
		"error":   message,
	})
}

// Helper: get userID from context
func GetUserID(c *fiber.Ctx) (int, bool) {
	userID, ok := c.Locals("userID").(int)
	return userID, ok
}

// RequireRole middleware (RBAC)
func RequireRole(logger observability.Logger, allowedRoleIDs ...int) fiber.Handler {
	return func(c *fiber.Ctx) error {
		roleID, ok := c.Locals("roleID").(int)

		// Validasi: roleID harus ada dan bukan 0
		if !ok || roleID == 0 {
			logger.Warn("role_check_failed: roleID not found or invalid ip=%s", c.IP())
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"success": false,
				"error":   "Forbidden: insufficient permissions",
			})
		}

		// Cek apakah roleID user ada di list yang diizinkan
		for _, allowed := range allowedRoleIDs {
			if roleID == allowed {
				logger.Info("role_check_success: roleID=%d ip=%s", roleID, c.IP())
				return c.Next()
			}
		}

		logger.Warn(
			"role_check_failed: user roleID=%d not in allowed=%v ip=%s",
			roleID, allowedRoleIDs, c.IP(),
		)
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Forbidden: insufficient permissions",
		})
	}
}

// HASROLE
func HasRole(c *fiber.Ctx, roleIDs ...int) bool {
	roleID, ok := c.Locals("roleID").(int)
	if !ok || roleID == 0 {
		return false
	}
	for _, id := range roleIDs {
		if roleID == id {
			return true
		}
	}
	return false
}
