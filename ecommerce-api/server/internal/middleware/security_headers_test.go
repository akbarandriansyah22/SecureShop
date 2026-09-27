package middleware

import (
	"bytes"
	"io"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"

	"github.com/akbarandriansyah22/BackendProject_and_Portofolio/e-commerce-api/server/internal/observability"
)

func TestSecurityHeaders(t *testing.T) {
	app := fiber.New()
	app.Use(SecurityHeaders())
	app.Get("/live", func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})
	resp, err := app.Test(httptest.NewRequest(fiber.MethodGet, "/live", nil))
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.Header.Get("X-Content-Type-Options") != "nosniff" {
		t.Fatalf("nosniff missing: %q", resp.Header.Get("X-Content-Type-Options"))
	}
	if resp.Header.Get("X-Frame-Options") != "DENY" {
		t.Fatalf("frame: %q", resp.Header.Get("X-Frame-Options"))
	}
	if resp.Header.Get("Referrer-Policy") != "strict-origin-when-cross-origin" {
		t.Fatalf("referrer: %q", resp.Header.Get("Referrer-Policy"))
	}
}

func TestAuthRateLimitBurstReturns429(t *testing.T) {
	logger := observability.NewLogger()
	cfg := DefaultAuthRateLimitConfig(logger)
	app := fiber.New()
	limit := NewRateLimitMiddleware(cfg)
	app.Post("/api/auth/login", limit, func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})
	app.Post("/api/auth/register", limit, func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusCreated)
	})

	body := []byte(`{"email":"burst@example.com","password":"secret"}`)
	var last int
	for i := 0; i < int(cfg.Capacity)+1; i++ {
		req := httptest.NewRequest(fiber.MethodPost, "/api/auth/login", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatal(err)
		}
		last = resp.StatusCode
		_, _ = io.Copy(io.Discard, resp.Body)
		resp.Body.Close()
	}
	if last != fiber.StatusTooManyRequests {
		t.Fatalf("login burst: want 429, got %d", last)
	}

	reg := httptest.NewRequest(fiber.MethodPost, "/api/auth/register", bytes.NewReader(body))
	reg.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(reg, -1)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != fiber.StatusTooManyRequests {
		t.Fatalf("register shares auth limiter: want 429, got %d", resp.StatusCode)
	}
}
