package middleware

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"

	"github.com/akbarandriansyah22/BackendProject_and_Portofolio/e-commerce-api/server/internal/models"
	"github.com/akbarandriansyah22/BackendProject_and_Portofolio/e-commerce-api/server/internal/observability"
	"github.com/akbarandriansyah22/BackendProject_and_Portofolio/e-commerce-api/server/internal/security"
)

type stubUsers struct {
	user *models.User
}

func (s stubUsers) GetByID(ctx context.Context, id int) (*models.User, error) {
	_ = ctx
	_ = id
	return s.user, nil
}

func doRequest(t *testing.T, app *fiber.App, req *http.Request) *http.Response {
	t.Helper()
	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		_ = resp.Body.Close()
	})
	if _, err := io.ReadAll(resp.Body); err != nil {
		t.Fatal(err)
	}
	return resp
}

func TestRequireRole_CustomerDeniedAdmin(t *testing.T) {
	logger := observability.NewLogger()
	app := fiber.New()
	app.Get("/admin", func(c *fiber.Ctx) error {
		c.Locals("roleID", 2)
		return c.Next()
	}, RequireRole(logger, 1), func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})

	resp := doRequest(t, app, httptest.NewRequest(http.MethodGet, "/admin", nil))
	if resp.StatusCode != fiber.StatusForbidden {
		t.Fatalf("want 403, got %d", resp.StatusCode)
	}
}

func TestRequireRole_AdminAllowed(t *testing.T) {
	logger := observability.NewLogger()
	app := fiber.New()
	app.Get("/admin", func(c *fiber.Ctx) error {
		c.Locals("roleID", 1)
		return c.Next()
	}, RequireRole(logger, 1), func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})

	resp := doRequest(t, app, httptest.NewRequest(http.MethodGet, "/admin", nil))
	if resp.StatusCode != fiber.StatusOK {
		t.Fatalf("want 200, got %d", resp.StatusCode)
	}
}

func TestAuth_RejectsMissingToken(t *testing.T) {
	logger := observability.NewLogger()
	app := fiber.New()
	app.Get("/me", Auth("test-secret-must-be-at-least-32-chars", logger, stubUsers{}), func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})

	resp := doRequest(t, app, httptest.NewRequest(http.MethodGet, "/me", nil))
	if resp.StatusCode != fiber.StatusUnauthorized {
		t.Fatalf("want 401, got %d", resp.StatusCode)
	}
}

func TestAuth_AcceptsValidToken(t *testing.T) {
	secret := "test-secret-must-be-at-least-32-chars"
	logger := observability.NewLogger()
	token, err := security.GenerateToken(2, "cust@example.com", 1, "Cust", secret, 1, 0)
	if err != nil {
		t.Fatal(err)
	}

	app := fiber.New()
	app.Get("/me", Auth(secret, logger, stubUsers{user: &models.User{ID: 2, Email: "cust@example.com", RoleID: 2, IsActive: true}}), func(c *fiber.Ctx) error {
		if c.Locals("roleID") != 2 {
			return c.SendStatus(fiber.StatusForbidden)
		}
		return c.SendStatus(fiber.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/me", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp := doRequest(t, app, req)
	if resp.StatusCode != fiber.StatusOK {
		t.Fatalf("want 200, got %d", resp.StatusCode)
	}
}
