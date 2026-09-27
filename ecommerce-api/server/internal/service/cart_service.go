package service

import (
	"context"
	"fmt"

	"github.com/akbarandriansyah22/BackendProject_and_Portofolio/e-commerce-api/server/internal/models"
	"github.com/akbarandriansyah22/BackendProject_and_Portofolio/e-commerce-api/server/internal/observability"
	"github.com/akbarandriansyah22/BackendProject_and_Portofolio/e-commerce-api/server/internal/ports"
)

// CartService handles cart business logic
type CartService struct {
	cartRepo    ports.CartRepository
	productRepo ports.ProductRepository
	logger      observability.Logger
}

// NewCartService creates a new cart service
func NewCartService(
	cartRepo ports.CartRepository,
	productRepo ports.ProductRepository,
	logger observability.Logger,
) *CartService {
	return &CartService{
		cartRepo:    cartRepo,
		productRepo: productRepo,
		logger:      logger,
	}
}

// GetCart gets user's cart. User tanpa baris cart mendapat cart kosong (200).
func (s *CartService) GetCart(ctx context.Context, userID int) (*models.CartResponse, error) {
	cart, err := s.cartRepo.GetByUserID(ctx, userID)
	if err != nil || cart == nil {
		cart, err = s.cartRepo.Create(ctx, userID)
		if err != nil || cart == nil {
			s.logger.Error("CartService.GetCart failed", err)
			return nil, fmt.Errorf("failed to get cart")
		}
	}

	return s.cartResponse(ctx, cart)
}

func (s *CartService) cartResponse(ctx context.Context, cart *models.Cart) (*models.CartResponse, error) {
	rows, err := s.cartRepo.GetCartItems(ctx, cart.ID)
	if err != nil {
		s.logger.Error("CartService.GetCart failed to get items", err)
		return nil, fmt.Errorf("failed to get cart items: %w", err)
	}

	items := make([]models.CartItemWithProduct, 0, len(rows))
	var totalPrice float64
	var totalQty int
	for _, row := range rows {
		if row == nil {
			continue
		}
		items = append(items, *row)
		totalQty += row.Quantity
		totalPrice += row.Price * float64(row.Quantity)
	}

	return &models.CartResponse{
		ID:            cart.ID,
		UserID:        cart.UserID,
		Items:         items,
		TotalPrice:    totalPrice,
		TotalQuantity: totalQty,
	}, nil
}

// AddItem adds item to cart
func (s *CartService) AddItem(ctx context.Context, userID, productID, quantity int) error {
	if quantity <= 0 {
		return fmt.Errorf("quantity must be greater than 0")
	}
	if quantity > maxCartQuantity {
		return fmt.Errorf("quantity exceeds maximum")
	}

	// Get product
	product, err := s.productRepo.GetByID(ctx, productID)
	if err != nil || product == nil {
		return fmt.Errorf("product not found")
	}
	if quantity > product.Stock {
		return fmt.Errorf("insufficient stock")
	}

	// Get or create cart
	cart, err := s.cartRepo.GetByUserID(ctx, userID)
	if err != nil {
		cart, err = s.cartRepo.Create(ctx, userID)
		if err != nil {
			s.logger.Error("CartService.AddItem failed to create cart", err)
			return fmt.Errorf("failed to create cart")
		}
	}

	exists, current, err := s.cartRepo.CheckItemExists(ctx, cart.ID, productID)
	if err != nil {
		return fmt.Errorf("failed to add cart item: %w", err)
	}
	if exists && (current+quantity > maxCartQuantity || current+quantity > product.Stock) {
		return fmt.Errorf("quantity exceeds maximum")
	}

	if err := s.cartRepo.AddItem(ctx, cart.ID, productID, quantity); err != nil {
		s.logger.Error("CartService.AddItem failed", err)
		return fmt.Errorf("failed to add cart item: %w", err)
	}
	return nil
}

// UpdateItemQuantity changes quantity on an item in the caller's cart.
func (s *CartService) UpdateItemQuantity(ctx context.Context, userID, cartItemID, quantity int) error {
	if quantity <= 0 || quantity > maxCartQuantity {
		return fmt.Errorf("quantity exceeds maximum")
	}
	cart, err := s.cartRepo.GetByUserID(ctx, userID)
	if err != nil || cart == nil {
		return fmt.Errorf("cart item not found")
	}
	if err := s.cartRepo.UpdateItemQuantity(ctx, cart.ID, cartItemID, quantity); err != nil {
		if err.Error() == "cart item not found" {
			return err
		}
		return fmt.Errorf("failed to update cart item: %w", err)
	}
	return nil
}

// RemoveItem removes item from cart
const maxCartQuantity = 100

func (s *CartService) RemoveItem(ctx context.Context, userID, cartItemID int) error {
	cart, err := s.cartRepo.GetByUserID(ctx, userID)
	if err != nil || cart == nil {
		return fmt.Errorf("cart item not found")
	}
	return s.cartRepo.RemoveItem(ctx, cart.ID, cartItemID)
}

// ClearCart clears all items from cart
func (s *CartService) ClearCart(ctx context.Context, userID int) error {
	cart, err := s.cartRepo.GetByUserID(ctx, userID)
	if err != nil || cart == nil {
		return fmt.Errorf("cart not found")
	}

	return s.cartRepo.ClearCart(ctx, cart.ID)
}
