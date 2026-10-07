package repository

import "testing"

func TestCheckoutLineTotalUsesPriceAndRejectsLowStock(t *testing.T) {
	total, err := checkoutLineTotal(199000, 12, 2)
	if err != nil {
		t.Fatal(err)
	}
	if total != 398000 {
		t.Fatalf("total = %v", total)
	}

	if _, err := checkoutLineTotal(199000, 1, 2); err == nil || err.Error() != "insufficient stock" {
		t.Fatalf("got %v", err)
	}
	if _, err := checkoutLineTotal(199000, 50, 101); err == nil {
		t.Fatal("quantity above 100 was accepted")
	}
}
