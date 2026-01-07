#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timezone
import uuid

class ModerationWorkflowTester:
    def __init__(self, base_url="https://prince-media.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api"
        self.admin_token = None
        self.user_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
        # Admin credentials from review request
        self.admin_email = "paperboytheprince@gmail.com"
        self.admin_password = "PaperboyAdmin#2025!Secure1"
        
        # Test user credentials
        self.test_user_email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
        self.test_user_password = "TestUser123!"
        self.test_user_name = "Test User"
        
        # Test data storage
        self.created_post_id = None
        self.created_action_id = None
        self.rejected_post_id = None
        self.user_id = None

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}")
        else:
            self.failed_tests.append({"test": test_name, "details": details})
            print(f"❌ {test_name} - {details}")

    def make_request(self, method, endpoint, data=None, expected_status=None):
        """Make API request with proper headers"""
        url = f"{self.api_base}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        # Add auth token if available
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                return None, f"Unsupported method: {method}"

            if expected_status and response.status_code != expected_status:
                return None, f"Expected {expected_status}, got {response.status_code}: {response.text}"
            
            try:
                return response.json(), None
            except:
                return {"status_code": response.status_code}, None
                
        except Exception as e:
            return None, str(e)

    def test_admin_login(self):
        """Test admin login functionality"""
        print("\n🔐 Testing Admin Login...")
        
        data, error = self.make_request('POST', 'auth/login', {
            'email': self.admin_email,
            'password': self.admin_password
        }, expected_status=200)
        
        if error:
            self.log_result("Admin Login", False, error)
            return False
            
        if data and 'token' in data:
            self.token = data['token']
            self.log_result("Admin Login", True)
            return True
        else:
            self.log_result("Admin Login", False, "No token in response")
            return False

    def test_empty_posts(self):
        """Test that posts collection is empty (no demo data)"""
        print("\n📝 Testing Empty Posts State...")
        
        data, error = self.make_request('GET', 'posts', expected_status=200)
        
        if error:
            self.log_result("Empty Posts Check", False, error)
            return False
            
        posts_count = len(data) if data else 0
        if posts_count == 0:
            self.log_result("Empty Posts Check", True, "Database clean - no demo posts")
            return True
        else:
            self.log_result("Empty Posts Check", False, f"Found {posts_count} posts - should be empty for production")
            return False

    def test_empty_events(self):
        """Test that events collection is empty (no demo data)"""
        print("\n📅 Testing Empty Events State...")
        
        data, error = self.make_request('GET', 'events', expected_status=200)
        
        if error:
            self.log_result("Empty Events Check", False, error)
            return False
            
        events_count = len(data) if data else 0
        if events_count == 0:
            self.log_result("Empty Events Check", True, "Database clean - no demo events")
            return True
        else:
            self.log_result("Empty Events Check", False, f"Found {events_count} events - should be empty for production")
            return False

    def test_create_post(self):
        """Test admin can create a post"""
        print("\n✍️ Testing Post Creation...")
        
        if not self.token:
            self.log_result("Create Post", False, "No admin token available")
            return False
            
        post_data = {
            "title": "Welcome to Paperboy Prince 2026!",
            "content": "This is our first official post. Join us in building a better future for all.",
            "image_url": "https://customer-assets.emergentagent.com/job_prince-engage/artifacts/wdi4o708_IMG_5791_Original.jpg"
        }
        
        data, error = self.make_request('POST', 'posts', post_data, expected_status=200)
        
        if error:
            self.log_result("Create Post", False, error)
            return False
            
        if data and 'id' in data:
            self.created_post_id = data['id']
            self.log_result("Create Post", True, f"Post created with ID: {self.created_post_id}")
            return True
        else:
            self.log_result("Create Post", False, "No post ID in response")
            return False

    def test_create_event(self):
        """Test admin can create an event"""
        print("\n🎉 Testing Event Creation...")
        
        if not self.token:
            self.log_result("Create Event", False, "No admin token available")
            return False
            
        event_data = {
            "title": "Community Town Hall",
            "description": "Join us for our first community town hall meeting to discuss our vision for 2026.",
            "date": "2025-02-15T18:00:00Z",
            "location": "Brooklyn Community Center, 123 Main St",
            "image_url": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800"
        }
        
        data, error = self.make_request('POST', 'events', event_data, expected_status=200)
        
        if error:
            self.log_result("Create Event", False, error)
            return False
            
        if data and 'id' in data:
            self.created_event_id = data['id']
            self.log_result("Create Event", True, f"Event created with ID: {self.created_event_id}")
            return True
        else:
            self.log_result("Create Event", False, "No event ID in response")
            return False

    def test_post_appears_in_feed(self):
        """Test that created post appears in posts feed"""
        print("\n📰 Testing Post Feed...")
        
        data, error = self.make_request('GET', 'posts', expected_status=200)
        
        if error:
            self.log_result("Post Appears in Feed", False, error)
            return False
            
        posts_count = len(data) if data else 0
        if posts_count == 1:
            post = data[0]
            if post.get('title') == "Welcome to Paperboy Prince 2026!":
                self.log_result("Post Appears in Feed", True, "Created post visible in feed")
                return True
            else:
                self.log_result("Post Appears in Feed", False, f"Post title mismatch: {post.get('title')}")
        else:
            self.log_result("Post Appears in Feed", False, f"Expected 1 post, found {posts_count}")
        return False

    def test_admin_stats(self):
        """Test admin stats endpoint"""
        print("\n📊 Testing Admin Stats...")
        
        if not self.token:
            self.log_result("Admin Stats", False, "No admin token available")
            return False
            
        data, error = self.make_request('GET', 'admin/stats', expected_status=200)
        
        if error:
            self.log_result("Admin Stats", False, error)
            return False
            
        if data:
            print(f"   📈 Stats: {data}")
            self.log_result("Admin Stats", True, "Stats retrieved successfully")
            return True
        else:
            self.log_result("Admin Stats", False, "No stats data returned")
            return False

    def cleanup_test_data(self):
        """Clean up test data created during testing"""
        print("\n🧹 Cleaning up test data...")
        
        if not self.token:
            return
            
        # Delete test post if created
        if self.created_post_id:
            data, error = self.make_request('DELETE', f'posts/{self.created_post_id}', expected_status=200)
            if not error:
                print(f"   ✅ Deleted test post: {self.created_post_id}")
            else:
                print(f"   ❌ Failed to delete test post: {error}")
                
        # Delete test event if created
        if self.created_event_id:
            data, error = self.make_request('DELETE', f'events/{self.created_event_id}', expected_status=200)
            if not error:
                print(f"   ✅ Deleted test event: {self.created_event_id}")
            else:
                print(f"   ❌ Failed to delete test event: {error}")

    def run_production_tests(self):
        """Run all production launch tests"""
        print("🚀 PRODUCTION LAUNCH TESTING")
        print("=" * 50)
        print("Testing database cleanup, admin functionality, and production readiness...")
        
        # Test sequence for production launch verification
        tests = [
            ("Admin Login", self.test_admin_login),
            ("Empty Posts (No Demo Data)", self.test_empty_posts),
            ("Empty Events (No Demo Data)", self.test_empty_events),
            ("Admin Can Create Post", self.test_create_post),
            ("Admin Can Create Event", self.test_create_event),
            ("Post Appears in Feed", self.test_post_appears_in_feed),
            ("Admin Stats Access", self.test_admin_stats),
        ]
        
        for test_name, test_func in tests:
            try:
                test_func()
            except Exception as e:
                self.log_result(test_name, False, f"Exception: {str(e)}")
        
        # Cleanup
        self.cleanup_test_data()
        
        # Print final results
        print("\n" + "=" * 50)
        print(f"📊 PRODUCTION LAUNCH TEST RESULTS")
        print(f"Tests Passed: {self.tests_passed}/{self.tests_run}")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for failure in self.failed_tests:
                print(f"  • {failure['test']}: {failure['details']}")
            return False
        else:
            print(f"\n✅ ALL PRODUCTION LAUNCH TESTS PASSED!")
            print(f"✅ Database is clean (no demo data)")
            print(f"✅ Admin functionality working")
            print(f"✅ Ready for production launch")
            return True

def main():
    tester = ProductionLaunchTester()
    success = tester.run_production_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())