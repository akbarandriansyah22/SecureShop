package handler

import (
	"bytes"
	"context"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"

	"github.com/akbarandriansyah22/BackendProject_and_Portofolio/e-commerce-api/server/internal/middleware"
	"github.com/akbarandriansyah22/BackendProject_and_Portofolio/e-commerce-api/server/internal/models"
	"github.com/akbarandriansyah22/BackendProject_and_Portofolio/e-commerce-api/server/internal/observability"
	"github.com/akbarandriansyah22/BackendProject_and_Portofolio/e-commerce-api/server/internal/security"
	"github.com/akbarandriansyah22/BackendProject_and_Portofolio/e-commerce-api/server/internal/service"
)

const idorJWTSecret = "test-secret-must-be-at-least-32-chars"

type idorUsers struct {
	byID map[int]*models.User
}

func (u idorUsers) GetByID(ctx context.Context, id int) (*models.User, error) {
	_ = ctx
	return u.byID[id], nil
}

func tokenFor(t *testing.T, userID int) string {
	t.Helper()
	tok, err := security.GenerateToken(userID, "u@example.com", middleware.RoleCustomer, "User", idorJWTSecret, 1, 0)
	if err != nil {
		t.Fatal(err)
	}
	return tok
}

type idorOrders struct {
	order  *models.Order
	status string
}

func (r *idorOrders) Create(ctx context.Context, order *models.Order) error { return nil }
func (r *idorOrders) Checkout(ctx context.Context, order *models.Order, lines []*models.OrderItem) error {
	return nil
}
func (r *idorOrders) CreateOrderItems(ctx context.Context, orderID int, items []*models.OrderItem) error {
	return nil
}
func (r *idorOrders) GetByID(ctx context.Context, id int) (*models.Order, error) {
	if r.order == nil || r.order.ID != id {
		return nil, errNotFound
	}
	cp := *r.order
	cp.Status = r.status
	return &cp, nil
}
func (r *idorOrders) GetByOrderNumber(ctx context.Context, orderNumber string) (*models.Order, error) {
	if r.order == nil || r.order.OrderNumber != orderNumber {
		return nil, errNotFound
	}
	return r.GetByID(ctx, r.order.ID)
}
func (r *idorOrders) GetOrderItems(ctx context.Context, orderID int) ([]*models.OrderItem, error) {
	return nil, nil
}
func (r *idorOrders) ListItemsWithProducts(ctx context.Context, orderID int) ([]*models.OrderItemWithProduct, error) {
	return nil, nil
}
func (r *idorOrders) Update(ctx context.Context, order *models.Order) error { return nil }
func (r *idorOrders) UpdateStatus(ctx context.Context, orderID int, status string) error {
	if r.order == nil || r.order.ID != orderID {
		return errNotFound
	}
	r.status = status
	return nil
}
func (r *idorOrders) GetUserOrders(ctx context.Context, userID int, page, limit int) ([]*models.Order, int, error) {
	return nil, 0, nil
}
func (r *idorOrders) GetAllOrders(ctx context.Context, filter *models.OrderFilter) ([]*models.Order, int, error) {
	return nil, 0, nil
}
func (r *idorOrders) GenerateOrderNumber(ctx context.Context) (string, error) { return "", nil }
func (r *idorOrders) CalculateTotal(ctx context.Context, items []*models.OrderItem) float64 {
	return 0
}
func (r *idorOrders) Delete(ctx context.Context, id int) error { return nil }

type errNotFoundType struct{}

func (errNotFoundType) Error() string { return "not found" }

var errNotFound errNotFoundType

type errCartItemMissingType struct{}

func (errCartItemMissingType) Error() string { return "cart item not found" }

var errCartItemMissing errCartItemMissingType

func orderApp(t *testing.T, orders *idorOrders) *fiber.App {
	t.Helper()
	logger := observability.NewLogger()
	svc := service.NewOrderService(orders, nil, nil, nil, logger)
	h := NewOrderHandler(svc, logger)
	users := idorUsers{byID: map[int]*models.User{
		2: {ID: 2, RoleID: middleware.RoleCustomer, Email: "a@example.com", IsActive: true},
		7: {ID: 7, RoleID: middleware.RoleCustomer, Email: "b@example.com", IsActive: true},
		1: {ID: 1, RoleID: middleware.RoleAdmin, Email: "admin@example.com", IsActive: true},
	}}
	app := fiber.New()
	api := app.Group("/api", middleware.Auth(idorJWTSecret, logger, users))
	api.Get("/orders/number/:orderNumber", h.GetByOrderNumber)
	api.Get("/orders/:id", h.GetByID)
	api.Post("/orders/:id/cancel", h.CancelOrder)
	admin := app.Group("/api/admin", middleware.Auth(idorJWTSecret, logger, users), middleware.RequireRole(logger, middleware.RoleAdmin))
	admin.Put("/orders/:id/status", h.UpdateStatus)
	return app
}

func doAuthed(t *testing.T, app *fiber.App, method, path, token, body string) int {
	t.Helper()
	req := httptest.NewRequest(method, path, bytes.NewBufferString(body))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req, -1)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	return resp.StatusCode
}

func TestIDOR_OrderReadAndCancelDenied(t *testing.T) {
	orders := &idorOrders{
		order:  &models.Order{ID: 42, UserID: 7, OrderNumber: "ORD-7", Status: "pending"},
		status: "pending",
	}
	app := orderApp(t, orders)
	attacker := tokenFor(t, 2)
	owner := tokenFor(t, 7)

	if code := doAuthed(t, app, "GET", "/api/orders/42", attacker, ""); code != fiber.StatusForbidden {
		t.Fatalf("attacker GET order: want 403, got %d", code)
	}
	if code := doAuthed(t, app, "GET", "/api/orders/number/ORD-7", attacker, ""); code != fiber.StatusForbidden {
		t.Fatalf("attacker GET by number: want 403, got %d", code)
	}
	if code := doAuthed(t, app, "POST", "/api/orders/42/cancel", attacker, ""); code != fiber.StatusForbidden {
		t.Fatalf("attacker cancel: want 403, got %d", code)
	}
	if orders.status != "pending" {
		t.Fatalf("attacker cancel changed status to %s", orders.status)
	}
	if code := doAuthed(t, app, "GET", "/api/orders/42", owner, ""); code != fiber.StatusOK {
		t.Fatalf("owner GET: want 200, got %d", code)
	}
	if code := doAuthed(t, app, "POST", "/api/orders/42/cancel", owner, ""); code != fiber.StatusOK {
		t.Fatalf("owner cancel: want 200, got %d", code)
	}
}

func TestAdminCanUpdateAnotherUsersOrder(t *testing.T) {
	orders := &idorOrders{
		order:  &models.Order{ID: 42, UserID: 7, OrderNumber: "ORD-7", Status: "pending"},
		status: "pending",
	}
	app := orderApp(t, orders)
	admin := tokenForRole(t, 1, middleware.RoleAdmin)
	code := doAuthed(t, app, "PUT", "/api/admin/orders/42/status", admin, `{"status":"shipped"}`)
	if code != fiber.StatusOK {
		t.Fatalf("admin status update: want 200, got %d", code)
	}
	if orders.status != "shipped" {
		t.Fatalf("status=%s", orders.status)
	}
}

func tokenForRole(t *testing.T, userID, role int) string {
	t.Helper()
	tok, err := security.GenerateToken(userID, "admin@example.com", role, "Admin", idorJWTSecret, 1, 0)
	if err != nil {
		t.Fatal(err)
	}
	return tok
}

type memCart struct {
	carts map[int]*models.Cart
	items map[int]*models.CartItem
}

func (m *memCart) Create(ctx context.Context, userID int) (*models.Cart, error) {
	return m.GetByUserID(ctx, userID)
}
func (m *memCart) GetByUserID(ctx context.Context, userID int) (*models.Cart, error) {
	for _, c := range m.carts {
		if c.UserID == userID {
			return c, nil
		}
	}
	return nil, errNotFound
}
func (m *memCart) AddItem(ctx context.Context, cartID, productID, quantity int) error { return nil }
func (m *memCart) UpdateItemQuantity(ctx context.Context, cartID, cartItemID, quantity int) error {
	item := m.items[cartItemID]
	if item == nil || item.CartID != cartID {
		return errCartItemMissing
	}
	item.Quantity = quantity
	return nil
}
func (m *memCart) RemoveItem(ctx context.Context, cartID, cartItemID int) error {
	item := m.items[cartItemID]
	if item == nil || item.CartID != cartID {
		return errCartItemMissing
	}
	delete(m.items, cartItemID)
	return nil
}
func (m *memCart) GetCartItems(ctx context.Context, cartID int) ([]*models.CartItemWithProduct, error) {
	var out []*models.CartItemWithProduct
	for _, item := range m.items {
		if item.CartID == cartID {
			out = append(out, &models.CartItemWithProduct{
				ID: item.ID, CartID: item.CartID, ProductID: item.ProductID, Quantity: item.Quantity, Price: item.Price,
			})
		}
	}
	return out, nil
}
func (m *memCart) ClearCart(ctx context.Context, cartID int) error { return nil }
func (m *memCart) GetItemCount(ctx context.Context, cartID int) (int, error) { return 0, nil }
func (m *memCart) GetCartTotal(ctx context.Context, cartID int) (float64, error) { return 0, nil }
func (m *memCart) CheckItemExists(ctx context.Context, cartID, productID int) (bool, int, error) {
	return false, 0, nil
}
func (m *memCart) Delete(ctx context.Context, cartID int) error { return nil }

func TestIDOR_CartItemMutationsDenied(t *testing.T) {
	repo := &memCart{
		carts: map[int]*models.Cart{
			10: {ID: 10, UserID: 2},
			20: {ID: 20, UserID: 7},
		},
		items: map[int]*models.CartItem{
			5: {ID: 5, CartID: 20, ProductID: 1, Quantity: 2, Price: 10},
		},
	}
	logger := observability.NewLogger()
	svc := service.NewCartService(repo, nil, logger)
	h := NewCartHandler(svc, logger)
	users := idorUsers{byID: map[int]*models.User{
		2: {ID: 2, RoleID: middleware.RoleCustomer, Email: "a@example.com", IsActive: true},
		7: {ID: 7, RoleID: middleware.RoleCustomer, Email: "b@example.com", IsActive: true},
	}}
	app := fiber.New()
	api := app.Group("/api", middleware.Auth(idorJWTSecret, logger, users))
	api.Get("/cart", h.GetCart)
	api.Put("/cart/items/:id", h.UpdateItem)
	api.Delete("/cart/items/:id", h.RemoveItem)

	attacker := tokenFor(t, 2)
	if code := doAuthed(t, app, "GET", "/api/cart", attacker, ""); code != fiber.StatusOK {
		t.Fatalf("own cart: want 200, got %d", code)
	}
	if code := doAuthed(t, app, "PUT", "/api/cart/items/5", attacker, `{"quantity":9}`); code != fiber.StatusNotFound && code != fiber.StatusForbidden {
		t.Fatalf("attacker PUT: want 403 or 404, got %d", code)
	}
	if repo.items[5].Quantity != 2 {
		t.Fatalf("quantity changed to %d", repo.items[5].Quantity)
	}
	if code := doAuthed(t, app, "DELETE", "/api/cart/items/5", attacker, ""); code != fiber.StatusNotFound && code != fiber.StatusForbidden {
		t.Fatalf("attacker DELETE: want 403 or 404, got %d", code)
	}
	if _, ok := repo.items[5]; !ok {
		t.Fatal("attacker deleted another user's cart item")
	}

	owner := tokenFor(t, 7)
	if code := doAuthed(t, app, "PUT", "/api/cart/items/5", owner, `{"quantity":4}`); code != fiber.StatusOK {
		t.Fatalf("owner PUT: want 200, got %d", code)
	}
	if repo.items[5].Quantity != 4 {
		t.Fatalf("owner quantity=%d", repo.items[5].Quantity)
	}
}
