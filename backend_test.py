#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timezone
import uuid

class ProductionLaunchTester:
    def __init__(self, base_url="https://prince-engage.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.admin_email = "admin@paperboyprince.com"
        self.admin_password = "admin123"
        
        # Test data storage
        self.created_post_id = None
        self.created_event_id = None

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}")
        else:
            self.failed_tests.append({"test": test_name, "details": details})
            print(f"❌ {test_name} - {details}")

    def make_request(self, method, endpoint, data=None, use_admin=False, expected_status=None):
        """Make API request with proper headers"""
        url = f"{self.api_base}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        # Add auth token if available
        token = self.admin_token if use_admin and self.admin_token else self.token
        if token:
            headers['Authorization'] = f'Bearer {token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                return False, f"Unsupported method: {method}"

            # Check expected status if provided
            if expected_status and response.status_code != expected_status:
                return False, f"Expected {expected_status}, got {response.status_code}: {response.text}"
            
            # Try to parse JSON response
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text}
            
            return response.status_code < 400, response_data
            
        except requests.exceptions.RequestException as e:
            return False, f"Request failed: {str(e)}"

    def test_seed_data(self):
        """Test seeding demo data"""
        success, response = self.make_request('POST', 'seed', expected_status=200)
        self.log_result("Seed demo data", success, 
                       "" if success else f"Failed to seed: {response}")
        return success

    def test_user_registration(self):
        """Test user registration"""
        test_email = f"test_user_{datetime.now().strftime('%H%M%S')}@example.com"
        user_data = {
            "name": "Test User",
            "email": test_email,
            "password": "testpass123"
        }
        
        success, response = self.make_request('POST', 'auth/register', user_data, expected_status=200)
        
        if success and 'token' in response and 'user' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            self.log_result("User registration", True)
            return True
        else:
            self.log_result("User registration", False, f"Response: {response}")
            return False

    def test_admin_login(self):
        """Test admin login with demo credentials"""
        admin_data = {
            "email": "admin@paperboyprince.com",
            "password": "admin123"
        }
        
        success, response = self.make_request('POST', 'auth/admin-login', admin_data, expected_status=200)
        
        if success and 'token' in response and 'user' in response:
            self.admin_token = response['token']
            self.admin_id = response['user']['id']
            is_admin = response['user'].get('is_admin', False)
            self.log_result("Admin login", is_admin, 
                           "" if is_admin else "User is not admin")
            return is_admin
        else:
            self.log_result("Admin login", False, f"Response: {response}")
            return False

    def test_get_posts(self):
        """Test getting all posts"""
        success, response = self.make_request('GET', 'posts', expected_status=200)
        
        if success and isinstance(response, list):
            self.log_result("Get posts", True)
            return True
        else:
            self.log_result("Get posts", False, f"Response: {response}")
            return False

    def test_create_post(self):
        """Test creating a post (admin only)"""
        if not self.admin_token:
            self.log_result("Create post", False, "No admin token available")
            return False
            
        post_data = {
            "title": "Test Post",
            "content": "This is a test post created during API testing.",
            "image_url": "https://images.unsplash.com/photo-1682447450943-c5785c84d047?w=800"
        }
        
        success, response = self.make_request('POST', 'posts', post_data, use_admin=True, expected_status=200)
        
        if success and 'id' in response:
            self.created_post_id = response['id']
            self.log_result("Create post", True)
            return True
        else:
            self.log_result("Create post", False, f"Response: {response}")
            return False

    def test_get_products(self):
        """Test getting all products"""
        success, response = self.make_request('GET', 'products', expected_status=200)
        
        if success and isinstance(response, list):
            self.log_result("Get products", True)
            return True
        else:
            self.log_result("Get products", False, f"Response: {response}")
            return False

    def test_create_product(self):
        """Test creating a product (admin only)"""
        if not self.admin_token:
            self.log_result("Create product", False, "No admin token available")
            return False
            
        product_data = {
            "title": "Test Product",
            "description": "A test product for API testing",
            "price": 29.99,
            "image_url": "https://images.unsplash.com/photo-1630269470859-f950f36b54ce?w=800",
            "available": False  # Shop is in "Coming Soon" state
        }
        
        success, response = self.make_request('POST', 'products', product_data, use_admin=True, expected_status=200)
        
        if success and 'id' in response:
            self.created_product_id = response['id']
            self.log_result("Create product", True)
            return True
        else:
            self.log_result("Create product", False, f"Response: {response}")
            return False

    def test_get_events(self):
        """Test getting all events"""
        success, response = self.make_request('GET', 'events', expected_status=200)
        
        if success and isinstance(response, list):
            self.log_result("Get events", True)
            return True
        else:
            self.log_result("Get events", False, f"Response: {response}")
            return False

    def test_create_event(self):
        """Test creating an event (admin only)"""
        if not self.admin_token:
            self.log_result("Create event", False, "No admin token available")
            return False
            
        event_data = {
            "title": "Test Event",
            "description": "A test event for API testing",
            "date": "2025-03-15T18:00:00",
            "location": "Test Location, Test City",
            "image_url": "https://images.unsplash.com/photo-1759605034474-b143695762c5?w=800"
        }
        
        success, response = self.make_request('POST', 'events', event_data, use_admin=True, expected_status=200)
        
        if success and 'id' in response:
            self.created_event_id = response['id']
            self.log_result("Create event", True)
            return True
        else:
            self.log_result("Create event", False, f"Response: {response}")
            return False

    def test_event_rsvp(self):
        """Test RSVP to an event"""
        if not self.token or not self.created_event_id:
            self.log_result("Event RSVP", False, "No user token or event ID available")
            return False
            
        success, response = self.make_request('POST', f'events/{self.created_event_id}/rsvp', 
                                            expected_status=200)
        
        if success and 'message' in response:
            self.log_result("Event RSVP", True)
            return True
        else:
            self.log_result("Event RSVP", False, f"Response: {response}")
            return False

    def test_get_actions(self):
        """Test getting all actions"""
        success, response = self.make_request('GET', 'actions', expected_status=200)
        
        if success and isinstance(response, list):
            self.log_result("Get actions", True)
            return True
        else:
            self.log_result("Get actions", False, f"Response: {response}")
            return False

    def test_create_action(self):
        """Test creating an action (admin only)"""
        if not self.admin_token:
            self.log_result("Create action", False, "No admin token available")
            return False
            
        action_data = {
            "title": "Test Volunteer Action",
            "description": "A test volunteer action for API testing",
            "action_type": "volunteer",
            "image_url": "https://images.unsplash.com/photo-1618477462146-050d2767ebd4?w=800"
        }
        
        success, response = self.make_request('POST', 'actions', action_data, use_admin=True, expected_status=200)
        
        if success and 'id' in response:
            self.created_action_id = response['id']
            self.log_result("Create action", True)
            return True
        else:
            self.log_result("Create action", False, f"Response: {response}")
            return False

    def test_action_signup(self):
        """Test signing up for an action"""
        if not self.token or not self.created_action_id:
            self.log_result("Action signup", False, "No user token or action ID available")
            return False
            
        signup_data = {"message": "I want to help with this test action!"}
        success, response = self.make_request('POST', f'actions/{self.created_action_id}/signup', 
                                            signup_data, expected_status=200)
        
        if success and 'message' in response:
            self.log_result("Action signup", True)
            return True
        else:
            self.log_result("Action signup", False, f"Response: {response}")
            return False

    def test_cart_functionality(self):
        """Test cart operations"""
        if not self.token or not self.created_product_id:
            self.log_result("Cart functionality", False, "No user token or product ID available")
            return False
        
        # Test adding to cart
        cart_data = {"product_id": self.created_product_id, "quantity": 2}
        success, response = self.make_request('POST', 'cart/add', cart_data, expected_status=200)
        
        if not success:
            self.log_result("Cart functionality", False, f"Add to cart failed: {response}")
            return False
        
        # Test getting cart
        success, response = self.make_request('GET', 'cart', expected_status=200)
        
        if success and 'items' in response and 'total' in response:
            self.log_result("Cart functionality", True)
            return True
        else:
            self.log_result("Cart functionality", False, f"Get cart failed: {response}")
            return False

    def test_admin_stats(self):
        """Test admin statistics endpoint"""
        if not self.admin_token:
            self.log_result("Admin stats", False, "No admin token available")
            return False
            
        success, response = self.make_request('GET', 'admin/stats', use_admin=True, expected_status=200)
        
        if success and isinstance(response, dict) and 'users' in response:
            self.log_result("Admin stats", True)
            return True
        else:
            self.log_result("Admin stats", False, f"Response: {response}")
            return False

    def test_my_rsvps(self):
        """Test getting user's RSVPs"""
        if not self.token:
            self.log_result("My RSVPs", False, "No user token available")
            return False
            
        success, response = self.make_request('GET', 'my-rsvps', expected_status=200)
        
        if success and 'event_ids' in response:
            self.log_result("My RSVPs", True)
            return True
        else:
            self.log_result("My RSVPs", False, f"Response: {response}")
            return False

    def test_my_signups(self):
        """Test getting user's action signups"""
        if not self.token:
            self.log_result("My signups", False, "No user token available")
            return False
            
        success, response = self.make_request('GET', 'my-signups', expected_status=200)
        
        if success and 'action_ids' in response:
            self.log_result("My signups", True)
            return True
        else:
            self.log_result("My signups", False, f"Response: {response}")
            return False

    def test_notify_subscription(self):
        """Test notify me email subscription"""
        test_email = f"notify_test_{datetime.now().strftime('%H%M%S')}@example.com"
        notify_data = {"email": test_email}
        
        success, response = self.make_request('POST', 'notify', notify_data, expected_status=200)
        
        if success and 'id' in response and 'email' in response:
            self.log_result("Notify subscription", True)
            return True
        else:
            self.log_result("Notify subscription", False, f"Response: {response}")
            return False

    def test_get_notify_subscribers(self):
        """Test getting notify subscribers (admin only)"""
        if not self.admin_token:
            self.log_result("Get notify subscribers", False, "No admin token available")
            return False
            
        success, response = self.make_request('GET', 'notify/subscribers', use_admin=True, expected_status=200)
        
        if success and isinstance(response, list):
            self.log_result("Get notify subscribers", True)
            return True
        else:
            self.log_result("Get notify subscribers", False, f"Response: {response}")
            return False

    def test_duplicate_notify_subscription(self):
        """Test duplicate email subscription (should return existing)"""
        test_email = "test@example.com"  # Use a known email
        notify_data = {"email": test_email}
        
        # First subscription
        success1, response1 = self.make_request('POST', 'notify', notify_data, expected_status=200)
        
        # Second subscription (should return existing)
        success2, response2 = self.make_request('POST', 'notify', notify_data, expected_status=200)
        
        if success1 and success2 and response1.get('email') == response2.get('email'):
            self.log_result("Duplicate notify subscription", True)
            return True
        else:
            self.log_result("Duplicate notify subscription", False, 
                           f"First: {response1}, Second: {response2}")
            return False

    def run_all_tests(self):
        """Run comprehensive API test suite"""
        print("🚀 Starting Paperboy Prince Platform API Tests")
        print("=" * 60)
        
        # Basic setup tests
        self.test_seed_data()
        
        # Authentication tests
        self.test_user_registration()
        self.test_admin_login()
        
        # Content tests
        self.test_get_posts()
        self.test_create_post()
        
        # Product tests
        self.test_get_products()
        self.test_create_product()
        
        # Event tests
        self.test_get_events()
        self.test_create_event()
        self.test_event_rsvp()
        
        # Action tests
        self.test_get_actions()
        self.test_create_action()
        self.test_action_signup()
        
        # Cart tests
        self.test_cart_functionality()
        
        # Admin tests
        self.test_admin_stats()
        
        # User profile tests
        self.test_my_rsvps()
        self.test_my_signups()
        
        # Notify me tests
        self.test_notify_subscription()
        self.test_get_notify_subscribers()
        self.test_duplicate_notify_subscription()
        
        # Print results
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for failure in self.failed_tests:
                print(f"  - {failure['test']}: {failure['details']}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"✨ Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = PaperboyPrinceAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except Exception as e:
        print(f"💥 Test execution failed: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())