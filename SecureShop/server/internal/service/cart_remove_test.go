package service

import (
	"context"
	"testing"

	"github.com/akbarandriansyah22/BackendProject_and_Portofolio/e-commerce-api/server/internal/models"
	"github.com/akbarandriansyah22/BackendProject_and_Portofolio/e-commerce-api/server/internal/observability"
)

type removeCartRepo struct {
	cart        *models.Cart
	removedID   int
	removedCart int
}

func (r *removeCartRepo) Create(ctx context.Context, userID int) (*models.Cart, error) {
	return r.cart, nil
}
func (r *removeCartRepo) GetByUserID(ctx context.Context, userID int) (*models.Cart, error) {
	_ = ctx
	_ = userID
	if r.cart == nil {
		return nil, errCartMissing
	}
	return r.cart, nil
}
func (r *removeCartRepo) AddItem(ctx context.Context, cartID, productID, quantity int) error {
	return nil
}
func (r *removeCartRepo) UpdateItemQuantity(ctx context.Context, cartID, cartItemID, quantity int) error {
	return nil
}
func (r *removeCartRepo) RemoveItem(ctx context.Context, cartID, cartItemID int) error {
	_ = ctx
	r.removedCart = cartID
	r.removedID = cartItemID
	if cartID != r.cart.ID {
		return errCartMissing
	}
	return nil
}
func (r *removeCartRepo) GetCartItems(ctx context.Context, cartID int) ([]*models.CartItemWithProduct, error) {
	return nil, nil
}
func (r *removeCartRepo) ClearCart(ctx context.Context, cartID int) error { return nil }
func (r *removeCartRepo) GetItemCount(ctx context.Context, cartID int) (int, error) {
	return 0, nil
}
func (r *removeCartRepo) GetCartTotal(ctx context.Context, cartID int) (float64, error) {
	return 0, nil
}
func (r *removeCartRepo) CheckItemExists(ctx context.Context, cartID, productID int) (bool, int, error) {
	return false, 0, nil
}
func (r *removeCartRepo) Delete(ctx context.Context, cartID int) error { return nil }

type errString string

func (e errString) Error() string { return string(e) }

const errCartMissing errString = "cart item not found"

func TestRemoveItemUsesCallerCart(t *testing.T) {
	repo := &removeCartRepo{cart: &models.Cart{ID: 10, UserID: 4}}
	svc := NewCartService(repo, nil, observability.NewLogger())
	if err := svc.RemoveItem(context.Background(), 4, 5); err != nil {
		t.Fatal(err)
	}
	if repo.removedCart != 10 || repo.removedID != 5 {
		t.Fatalf("deleted cart=%d item=%d", repo.removedCart, repo.removedID)
	}
}

func TestRemoveItemOtherUserHasNoCartMatch(t *testing.T) {
	repo := &removeCartRepo{cart: nil}
	svc := NewCartService(repo, nil, observability.NewLogger())
	if err := svc.RemoveItem(context.Background(), 9, 5); err == nil {
		t.Fatal("expected failure when the caller has no cart")
	}
}
