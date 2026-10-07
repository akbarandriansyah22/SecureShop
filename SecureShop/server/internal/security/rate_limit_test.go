package security

import (
	"testing"
	"time"
)

func TestRateLimiter_BlocksAfterCapacity(t *testing.T) {
	rl := NewRateLimiter(3, time.Minute)
	key := "ip:1.2.3.4"

	for i := 0; i < 3; i++ {
		if !rl.IsAllowed(key) {
			t.Fatalf("request %d must pass", i+1)
		}
	}
	if rl.IsAllowed(key) {
		t.Fatal("4th request must be blocked")
	}
}

func TestRateLimiter_RefillsAfterWindow(t *testing.T) {
	rl := NewRateLimiter(1, 20*time.Millisecond)
	key := "ip:5.6.7.8"

	if !rl.IsAllowed(key) {
		t.Fatal("first request must pass")
	}
	if rl.IsAllowed(key) {
		t.Fatal("must block inside window")
	}
	time.Sleep(25 * time.Millisecond)
	if !rl.IsAllowed(key) {
		t.Fatal("must allow after window")
	}
}