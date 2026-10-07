package handler

import "testing"

func TestCustomerMayCancelOnlyPending(t *testing.T) {
	if !customerMayCancel("pending") {
		t.Fatal("pending should be cancellable")
	}
	if customerMayCancel("paid") {
		t.Fatal("paid must not be cancellable by a customer")
	}
	if customerMayCancel("shipped") || customerMayCancel("delivered") {
		t.Fatal("later statuses must not be cancellable")
	}
}
