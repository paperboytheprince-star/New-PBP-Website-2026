#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timezone
import uuid

class ModerationWorkflowTester:
    def __init__(self, base_url="https://content-hub-661.preview.emergentagent.com"):
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

    def make_request(self, method, endpoint, data=None, expected_status=None, token=None):
        """Make API request with proper headers"""
        url = f"{self.api_base}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        # Add auth token if provided or use admin token as default
        if token:
            headers['Authorization'] = f'Bearer {token}'
        elif self.admin_token:
            headers['Authorization'] = f'Bearer {self.admin_token}'

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
                return None, f"Unsupported method: {method}"

            if expected_status and response.status_code != expected_status:
                return None, f"Expected {expected_status}, got {response.status_code}: {response.text}"
            
            try:
                return response.json(), None
            except:
                return {"status_code": response.status_code}, None
                
        except Exception as e:
            return None, str(e)

    # ============ AUTHENTICATION TESTS ============

    def test_user_registration(self):
        """Test user registration"""
        print("\n👤 Testing User Registration...")
        
        data, error = self.make_request('POST', 'auth/register', {
            'email': self.test_user_email,
            'password': self.test_user_password,
            'name': self.test_user_name
        }, expected_status=200, token=None)
        
        if error:
            self.log_result("User Registration", False, error)
            return False
            
        if data and 'token' in data and 'user' in data:
            self.user_token = data['token']
            self.user_id = data['user']['id']
            is_admin = data['user'].get('is_admin', False)
            if is_admin:
                self.log_result("User Registration", False, "New user should not be admin")
                return False
            self.log_result("User Registration", True, f"User created: {self.user_id}")
            return True
        else:
            self.log_result("User Registration", False, "Invalid registration response")
            return False

    def test_user_login(self):
        """Test user login"""
        print("\n🔐 Testing User Login...")
        
        data, error = self.make_request('POST', 'auth/login', {
            'email': self.test_user_email,
            'password': self.test_user_password
        }, expected_status=200, token=None)
        
        if error:
            self.log_result("User Login", False, error)
            return False
            
        if data and 'token' in data:
            self.user_token = data['token']
            self.log_result("User Login", True)
            return True
        else:
            self.log_result("User Login", False, "No token in response")
            return False

    def test_admin_login(self):
        """Test admin login functionality"""
        print("\n🔐 Testing Admin Login...")
        
        data, error = self.make_request('POST', 'auth/login', {
            'email': self.admin_email,
            'password': self.admin_password
        }, expected_status=200, token=None)
        
        if error:
            self.log_result("Admin Login", False, error)
            return False
            
        if data and 'token' in data and 'user' in data:
            self.admin_token = data['token']
            is_admin = data['user'].get('is_admin', False)
            if not is_admin:
                self.log_result("Admin Login", False, "Admin user should have is_admin=true")
                return False
            self.log_result("Admin Login", True)
            return True
        else:
            self.log_result("Admin Login", False, "No token in response")
            return False

    # ============ POST MODERATION TESTS ============

    def test_user_creates_post_pending(self):
        """Test user creates post with pending status"""
        print("\n📝 Testing User Creates Post (Pending)...")
        
        if not self.user_token:
            self.log_result("User Creates Post", False, "No user token available")
            return False
            
        post_data = {
            "title": "Community Garden Initiative",
            "content": "I propose we start a community garden in our neighborhood to promote sustainable living and bring people together."
        }
        
        data, error = self.make_request('POST', 'posts', post_data, expected_status=200, token=self.user_token)
        
        if error:
            self.log_result("User Creates Post", False, error)
            return False
            
        if data and 'id' in data and data.get('status') == 'pending':
            self.created_post_id = data['id']
            self.log_result("User Creates Post", True, f"Post created with pending status: {self.created_post_id}")
            return True
        else:
            self.log_result("User Creates Post", False, f"Expected pending status, got: {data.get('status') if data else 'no data'}")
            return False

    def test_pending_post_not_in_public_feed(self):
        """Test pending post does not appear in public feed"""
        print("\n🚫 Testing Pending Post Not in Public Feed...")
        
        data, error = self.make_request('GET', 'posts', expected_status=200, token=None)
        
        if error:
            self.log_result("Pending Post Not in Public Feed", False, error)
            return False
            
        posts = data if data else []
        for post in posts:
            if post.get('id') == self.created_post_id:
                self.log_result("Pending Post Not in Public Feed", False, "Pending post found in public feed")
                return False
        
        self.log_result("Pending Post Not in Public Feed", True, "Pending post correctly hidden from public")
        return True

    def test_user_sees_own_pending_post(self):
        """Test user can see their own pending post"""
        print("\n👁️ Testing User Sees Own Pending Post...")
        
        if not self.user_token:
            self.log_result("User Sees Own Pending Post", False, "No user token available")
            return False
            
        data, error = self.make_request('GET', 'posts/my', expected_status=200, token=self.user_token)
        
        if error:
            self.log_result("User Sees Own Pending Post", False, error)
            return False
            
        posts = data if data else []
        for post in posts:
            if post.get('id') == self.created_post_id and post.get('status') == 'pending':
                self.log_result("User Sees Own Pending Post", True, "User can see their pending post")
                return True
        
        self.log_result("User Sees Own Pending Post", False, "User cannot see their pending post")
        return False

    def test_admin_sees_pending_post(self):
        """Test admin can see pending posts"""
        print("\n👮 Testing Admin Sees Pending Posts...")
        
        if not self.admin_token:
            self.log_result("Admin Sees Pending Posts", False, "No admin token available")
            return False
            
        data, error = self.make_request('GET', 'posts/pending', expected_status=200, token=self.admin_token)
        
        if error:
            self.log_result("Admin Sees Pending Posts", False, error)
            return False
            
        posts = data if data else []
        for post in posts:
            if post.get('id') == self.created_post_id and post.get('status') == 'pending':
                self.log_result("Admin Sees Pending Posts", True, "Admin can see pending post")
                return True
        
        self.log_result("Admin Sees Pending Posts", False, "Admin cannot see pending post")
        return False

    def test_admin_approves_post(self):
        """Test admin approves post"""
        print("\n✅ Testing Admin Approves Post...")
        
        if not self.admin_token or not self.created_post_id:
            self.log_result("Admin Approves Post", False, "Missing admin token or post ID")
            return False
            
        moderation_data = {"action": "approve"}
        
        data, error = self.make_request('POST', f'posts/{self.created_post_id}/moderate', 
                                      moderation_data, expected_status=200, token=self.admin_token)
        
        if error:
            self.log_result("Admin Approves Post", False, error)
            return False
            
        if data and data.get('status') == 'approved':
            self.log_result("Admin Approves Post", True, "Post successfully approved")
            return True
        else:
            self.log_result("Admin Approves Post", False, f"Expected approved status, got: {data.get('status') if data else 'no data'}")
            return False

    def test_approved_post_in_public_feed(self):
        """Test approved post appears in public feed"""
        print("\n📰 Testing Approved Post in Public Feed...")
        
        data, error = self.make_request('GET', 'posts', expected_status=200, token=None)
        
        if error:
            self.log_result("Approved Post in Public Feed", False, error)
            return False
            
        posts = data if data else []
        for post in posts:
            if post.get('id') == self.created_post_id and post.get('status') == 'approved':
                self.log_result("Approved Post in Public Feed", True, "Approved post visible in public feed")
                return True
        
        self.log_result("Approved Post in Public Feed", False, "Approved post not found in public feed")
        return False

    # ============ ACTION MODERATION TESTS ============

    def test_user_creates_action_pending(self):
        """Test user creates action with pending status"""
        print("\n🎯 Testing User Creates Action (Pending)...")
        
        if not self.user_token:
            self.log_result("User Creates Action", False, "No user token available")
            return False
            
        action_data = {
            "title": "Neighborhood Cleanup Volunteer Drive",
            "description": "Join us for a community cleanup event to make our neighborhood cleaner and more beautiful.",
            "action_type": "volunteer"
        }
        
        data, error = self.make_request('POST', 'actions', action_data, expected_status=200, token=self.user_token)
        
        if error:
            self.log_result("User Creates Action", False, error)
            return False
            
        if data and 'id' in data and data.get('status') == 'pending':
            self.created_action_id = data['id']
            self.log_result("User Creates Action", True, f"Action created with pending status: {self.created_action_id}")
            return True
        else:
            self.log_result("User Creates Action", False, f"Expected pending status, got: {data.get('status') if data else 'no data'}")
            return False

    def test_pending_action_not_in_public_feed(self):
        """Test pending action does not appear in public feed"""
        print("\n🚫 Testing Pending Action Not in Public Feed...")
        
        data, error = self.make_request('GET', 'actions', expected_status=200, token=None)
        
        if error:
            self.log_result("Pending Action Not in Public Feed", False, error)
            return False
            
        actions = data if data else []
        for action in actions:
            if action.get('id') == self.created_action_id:
                self.log_result("Pending Action Not in Public Feed", False, "Pending action found in public feed")
                return False
        
        self.log_result("Pending Action Not in Public Feed", True, "Pending action correctly hidden from public")
        return True

    def test_user_sees_own_pending_action(self):
        """Test user can see their own pending action"""
        print("\n👁️ Testing User Sees Own Pending Action...")
        
        if not self.user_token:
            self.log_result("User Sees Own Pending Action", False, "No user token available")
            return False
            
        data, error = self.make_request('GET', 'actions/my', expected_status=200, token=self.user_token)
        
        if error:
            self.log_result("User Sees Own Pending Action", False, error)
            return False
            
        actions = data if data else []
        for action in actions:
            if action.get('id') == self.created_action_id and action.get('status') == 'pending':
                self.log_result("User Sees Own Pending Action", True, "User can see their pending action")
                return True
        
        self.log_result("User Sees Own Pending Action", False, "User cannot see their pending action")
        return False

    def test_admin_sees_pending_action(self):
        """Test admin can see pending actions"""
        print("\n👮 Testing Admin Sees Pending Actions...")
        
        if not self.admin_token:
            self.log_result("Admin Sees Pending Actions", False, "No admin token available")
            return False
            
        data, error = self.make_request('GET', 'actions/pending', expected_status=200, token=self.admin_token)
        
        if error:
            self.log_result("Admin Sees Pending Actions", False, error)
            return False
            
        actions = data if data else []
        for action in actions:
            if action.get('id') == self.created_action_id and action.get('status') == 'pending':
                self.log_result("Admin Sees Pending Actions", True, "Admin can see pending action")
                return True
        
        self.log_result("Admin Sees Pending Actions", False, "Admin cannot see pending action")
        return False

    def test_admin_approves_action(self):
        """Test admin approves action"""
        print("\n✅ Testing Admin Approves Action...")
        
        if not self.admin_token or not self.created_action_id:
            self.log_result("Admin Approves Action", False, "Missing admin token or action ID")
            return False
            
        moderation_data = {"action": "approve"}
        
        data, error = self.make_request('POST', f'actions/{self.created_action_id}/moderate', 
                                      moderation_data, expected_status=200, token=self.admin_token)
        
        if error:
            self.log_result("Admin Approves Action", False, error)
            return False
            
        if data and data.get('status') == 'approved':
            self.log_result("Admin Approves Action", True, "Action successfully approved")
            return True
        else:
            self.log_result("Admin Approves Action", False, f"Expected approved status, got: {data.get('status') if data else 'no data'}")
            return False

    def test_approved_action_in_public_feed(self):
        """Test approved action appears in public feed"""
        print("\n📰 Testing Approved Action in Public Feed...")
        
        data, error = self.make_request('GET', 'actions', expected_status=200, token=None)
        
        if error:
            self.log_result("Approved Action in Public Feed", False, error)
            return False
            
        actions = data if data else []
        for action in actions:
            if action.get('id') == self.created_action_id and action.get('status') == 'approved':
                self.log_result("Approved Action in Public Feed", True, "Approved action visible in public feed")
                return True
        
        self.log_result("Approved Action in Public Feed", False, "Approved action not found in public feed")
        return False

    # ============ REJECTION FLOW TESTS ============

    def test_rejection_flow(self):
        """Test post rejection flow"""
        print("\n❌ Testing Post Rejection Flow...")
        
        if not self.user_token:
            self.log_result("Post Rejection Flow", False, "No user token available")
            return False
            
        # Create another post to reject
        post_data = {
            "title": "Inappropriate Content Test",
            "content": "This post will be rejected for testing purposes."
        }
        
        data, error = self.make_request('POST', 'posts', post_data, expected_status=200, token=self.user_token)
        
        if error:
            self.log_result("Post Rejection Flow", False, f"Failed to create post for rejection: {error}")
            return False
            
        if not data or 'id' not in data:
            self.log_result("Post Rejection Flow", False, "No post ID in response")
            return False
            
        self.rejected_post_id = data['id']
        
        # Now reject it as admin
        if not self.admin_token:
            self.log_result("Post Rejection Flow", False, "No admin token available")
            return False
            
        moderation_data = {
            "action": "reject",
            "rejection_reason": "Does not meet guidelines"
        }
        
        data, error = self.make_request('POST', f'posts/{self.rejected_post_id}/moderate', 
                                      moderation_data, expected_status=200, token=self.admin_token)
        
        if error:
            self.log_result("Post Rejection Flow", False, f"Failed to reject post: {error}")
            return False
            
        if data and data.get('status') == 'rejected' and data.get('rejection_reason') == "Does not meet guidelines":
            self.log_result("Post Rejection Flow", True, "Post successfully rejected with reason")
            return True
        else:
            self.log_result("Post Rejection Flow", False, f"Expected rejected status with reason, got: {data}")
            return False

    def test_user_sees_rejected_post(self):
        """Test user can see their rejected post with reason"""
        print("\n👁️ Testing User Sees Rejected Post...")
        
        if not self.user_token or not self.rejected_post_id:
            self.log_result("User Sees Rejected Post", False, "Missing user token or rejected post ID")
            return False
            
        data, error = self.make_request('GET', 'posts/my', expected_status=200, token=self.user_token)
        
        if error:
            self.log_result("User Sees Rejected Post", False, error)
            return False
            
        posts = data if data else []
        for post in posts:
            if (post.get('id') == self.rejected_post_id and 
                post.get('status') == 'rejected' and 
                post.get('rejection_reason') == "Does not meet guidelines"):
                self.log_result("User Sees Rejected Post", True, "User can see rejected post with reason")
                return True
        
        self.log_result("User Sees Rejected Post", False, "User cannot see rejected post with proper status/reason")
        return False

    # ============ NOTIFICATION TESTS ============

    def test_admin_notifications(self):
        """Test admin notifications"""
        print("\n🔔 Testing Admin Notifications...")
        
        if not self.admin_token:
            self.log_result("Admin Notifications", False, "No admin token available")
            return False
            
        data, error = self.make_request('GET', 'notifications', expected_status=200, token=self.admin_token)
        
        if error:
            self.log_result("Admin Notifications", False, error)
            return False
            
        if isinstance(data, list):
            self.log_result("Admin Notifications", True, f"Retrieved {len(data)} notifications")
            return True
        else:
            self.log_result("Admin Notifications", False, "Expected list of notifications")
            return False

    def test_unread_notification_count(self):
        """Test unread notification count"""
        print("\n📊 Testing Unread Notification Count...")
        
        if not self.admin_token:
            self.log_result("Unread Notification Count", False, "No admin token available")
            return False
            
        data, error = self.make_request('GET', 'notifications/unread-count', expected_status=200, token=self.admin_token)
        
        if error:
            self.log_result("Unread Notification Count", False, error)
            return False
            
        if data and 'unread_count' in data and isinstance(data['unread_count'], int):
            self.log_result("Unread Notification Count", True, f"Unread count: {data['unread_count']}")
            return True
        else:
            self.log_result("Unread Notification Count", False, "Invalid unread count response")
            return False

    # ============ HEALTH CHECK TESTS ============

    def test_health_check(self):
        """Test health check endpoint"""
        print("\n🏥 Testing Health Check...")
        
        data, error = self.make_request('GET', 'health', expected_status=200, token=None)
        
        if error:
            self.log_result("Health Check", False, error)
            return False
            
        if (data and 
            data.get('api') == 'ok' and 
            data.get('database') == 'ok'):
            self.log_result("Health Check", True, "API and database healthy")
            return True
        else:
            self.log_result("Health Check", False, f"Health check failed: {data}")
            return False

    # ============ PASSWORD CHANGE TEST ============

    def test_change_password(self):
        """Test password change functionality"""
        print("\n🔑 Testing Password Change...")
        
        if not self.user_token:
            self.log_result("Password Change", False, "No user token available")
            return False
            
        new_password = "NewTestPassword123!"
        password_data = {
            "current_password": self.test_user_password,
            "new_password": new_password
        }
        
        data, error = self.make_request('POST', 'auth/change-password', password_data, 
                                      expected_status=200, token=self.user_token)
        
        if error:
            self.log_result("Password Change", False, error)
            return False
            
        if data and data.get('message') == "Password changed successfully":
            # Test login with new password
            login_data = {
                'email': self.test_user_email,
                'password': new_password
            }
            
            login_response, login_error = self.make_request('POST', 'auth/login', login_data, 
                                                          expected_status=200, token=None)
            
            if login_error:
                self.log_result("Password Change", False, f"Login with new password failed: {login_error}")
                return False
                
            if login_response and 'token' in login_response:
                self.log_result("Password Change", True, "Password changed and login successful")
                return True
            else:
                self.log_result("Password Change", False, "Login with new password failed")
                return False
        else:
            self.log_result("Password Change", False, f"Unexpected response: {data}")
            return False

    def cleanup_test_data(self):
        """Clean up test data created during testing"""
        print("\n🧹 Cleaning up test data...")
        
        if not self.admin_token:
            return
            
        # Delete test posts if created
        if self.created_post_id:
            data, error = self.make_request('DELETE', f'posts/{self.created_post_id}', 
                                          expected_status=200, token=self.admin_token)
            if not error:
                print(f"   ✅ Deleted test post: {self.created_post_id}")
            else:
                print(f"   ❌ Failed to delete test post: {error}")
                
        if self.rejected_post_id:
            data, error = self.make_request('DELETE', f'posts/{self.rejected_post_id}', 
                                          expected_status=200, token=self.admin_token)
            if not error:
                print(f"   ✅ Deleted rejected post: {self.rejected_post_id}")
            else:
                print(f"   ❌ Failed to delete rejected post: {error}")
                
        # Delete test action if created
        if self.created_action_id:
            data, error = self.make_request('DELETE', f'actions/{self.created_action_id}', 
                                          expected_status=200, token=self.admin_token)
            if not error:
                print(f"   ✅ Deleted test action: {self.created_action_id}")
            else:
                print(f"   ❌ Failed to delete test action: {error}")

    def run_moderation_tests(self):
        """Run all moderation workflow tests"""
        print("🔄 MODERATION WORKFLOW TESTING")
        print("=" * 60)
        print("Testing complete moderation workflow for posts and actions...")
        
        # Test sequence for moderation workflow verification
        tests = [
            # Authentication Tests
            ("1. User Registration", self.test_user_registration),
            ("2. User Login", self.test_user_login),
            ("3. Admin Login", self.test_admin_login),
            
            # Post Moderation Tests
            ("4. User Creates Post (Pending)", self.test_user_creates_post_pending),
            ("5. Pending Post Not in Public Feed", self.test_pending_post_not_in_public_feed),
            ("6. User Sees Own Pending Post", self.test_user_sees_own_pending_post),
            ("7. Admin Sees Pending Posts", self.test_admin_sees_pending_post),
            ("8. Admin Approves Post", self.test_admin_approves_post),
            ("9. Approved Post in Public Feed", self.test_approved_post_in_public_feed),
            
            # Action Moderation Tests
            ("10. User Creates Action (Pending)", self.test_user_creates_action_pending),
            ("11. Pending Action Not in Public Feed", self.test_pending_action_not_in_public_feed),
            ("12. User Sees Own Pending Action", self.test_user_sees_own_pending_action),
            ("13. Admin Sees Pending Actions", self.test_admin_sees_pending_action),
            ("14. Admin Approves Action", self.test_admin_approves_action),
            ("15. Approved Action in Public Feed", self.test_approved_action_in_public_feed),
            
            # Rejection Flow Tests
            ("16. Post Rejection Flow", self.test_rejection_flow),
            ("17. User Sees Rejected Post", self.test_user_sees_rejected_post),
            
            # Notification Tests
            ("18. Admin Notifications", self.test_admin_notifications),
            ("19. Unread Notification Count", self.test_unread_notification_count),
            
            # Health and Password Tests
            ("20. Health Check", self.test_health_check),
            ("21. Password Change", self.test_change_password),
        ]
        
        for test_name, test_func in tests:
            try:
                test_func()
            except Exception as e:
                self.log_result(test_name, False, f"Exception: {str(e)}")
        
        # Cleanup
        self.cleanup_test_data()
        
        # Print final results
        print("\n" + "=" * 60)
        print(f"📊 MODERATION WORKFLOW TEST RESULTS")
        print(f"Tests Passed: {self.tests_passed}/{self.tests_run}")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for failure in self.failed_tests:
                print(f"  • {failure['test']}: {failure['details']}")
            return False
        else:
            print(f"\n✅ ALL MODERATION WORKFLOW TESTS PASSED!")
            print(f"✅ User registration and login working")
            print(f"✅ Admin authentication working")
            print(f"✅ Post moderation workflow complete")
            print(f"✅ Action moderation workflow complete")
            print(f"✅ Rejection flow working")
            print(f"✅ Admin notifications working")
            print(f"✅ Health check and password change working")
            return True

def main():
    tester = ModerationWorkflowTester()
    success = tester.run_moderation_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())