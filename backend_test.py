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
        self.test_comment_id = None
        self.existing_post_ids = []

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

    # ============ POSTS EXPERIENCE TESTS ============

    def test_get_posts_pagination(self):
        """Test GET /api/posts with pagination"""
        print("\n📄 Testing Posts Pagination...")
        
        # Test with page=1, limit=3
        data, error = self.make_request('GET', 'posts?page=1&limit=3', expected_status=200, token=None)
        
        if error:
            self.log_result("Posts Pagination", False, error)
            return False
            
        if (data and 'posts' in data and 'total' in data and 'page' in data and 
            'limit' in data and 'total_pages' in data):
            posts = data['posts']
            if len(posts) <= 3 and data['page'] == 1 and data['limit'] == 3:
                # Store existing post IDs for later tests
                self.existing_post_ids = [post['id'] for post in posts if post.get('status') == 'approved']
                self.log_result("Posts Pagination", True, f"Retrieved {len(posts)} posts with pagination")
                return True
            else:
                self.log_result("Posts Pagination", False, f"Pagination parameters incorrect: {data}")
                return False
        else:
            self.log_result("Posts Pagination", False, "Missing pagination fields in response")
            return False

    def test_get_posts_search(self):
        """Test GET /api/posts with search functionality"""
        print("\n🔍 Testing Posts Search...")
        
        # Test search for "City" (case insensitive)
        data, error = self.make_request('GET', 'posts?search=City', expected_status=200, token=None)
        
        if error:
            self.log_result("Posts Search", False, error)
            return False
            
        if data and 'posts' in data:
            posts = data['posts']
            # Check if search is working (posts should contain "City" in title or content)
            search_working = True
            for post in posts:
                title = post.get('title', '').lower()
                content = post.get('content', '').lower()
                if 'city' not in title and 'city' not in content:
                    search_working = False
                    break
            
            if search_working or len(posts) == 0:  # Empty result is also valid
                self.log_result("Posts Search", True, f"Search returned {len(posts)} posts")
                return True
            else:
                self.log_result("Posts Search", False, "Search results don't match search term")
                return False
        else:
            self.log_result("Posts Search", False, "Invalid search response")
            return False

    def test_get_posts_sort(self):
        """Test GET /api/posts with sort functionality"""
        print("\n📊 Testing Posts Sort...")
        
        # Test newest sort
        data_newest, error = self.make_request('GET', 'posts?sort=newest', expected_status=200, token=None)
        
        if error:
            self.log_result("Posts Sort", False, f"Newest sort error: {error}")
            return False
            
        # Test oldest sort
        data_oldest, error = self.make_request('GET', 'posts?sort=oldest', expected_status=200, token=None)
        
        if error:
            self.log_result("Posts Sort", False, f"Oldest sort error: {error}")
            return False
            
        if (data_newest and 'posts' in data_newest and 
            data_oldest and 'posts' in data_oldest):
            
            newest_posts = data_newest['posts']
            oldest_posts = data_oldest['posts']
            
            # Check if we have posts to compare
            if len(newest_posts) >= 2 and len(oldest_posts) >= 2:
                # Compare first post dates (newest should be more recent)
                newest_first_date = newest_posts[0].get('created_at', '')
                oldest_first_date = oldest_posts[0].get('created_at', '')
                
                if newest_first_date >= oldest_first_date:
                    self.log_result("Posts Sort", True, "Sort functionality working")
                    return True
                else:
                    self.log_result("Posts Sort", False, "Sort order incorrect")
                    return False
            else:
                self.log_result("Posts Sort", True, "Sort endpoints working (insufficient data to verify order)")
                return True
        else:
            self.log_result("Posts Sort", False, "Invalid sort response")
            return False

    def test_get_latest_posts(self):
        """Test GET /api/posts/latest"""
        print("\n⭐ Testing Latest Posts...")
        
        data, error = self.make_request('GET', 'posts/latest', expected_status=200, token=None)
        
        if error:
            self.log_result("Latest Posts", False, error)
            return False
            
        if isinstance(data, list):
            # Check that all posts have comment_count and are approved
            all_valid = True
            for post in data:
                if ('comment_count' not in post or 
                    post.get('status') != 'approved'):
                    all_valid = False
                    break
            
            if all_valid:
                self.log_result("Latest Posts", True, f"Retrieved {len(data)} latest posts with comment counts")
                return True
            else:
                self.log_result("Latest Posts", False, "Posts missing comment_count or not approved")
                return False
        else:
            self.log_result("Latest Posts", False, "Expected array of posts")
            return False

    def test_get_single_post(self):
        """Test GET /api/posts/{post_id}"""
        print("\n📖 Testing Single Post Retrieval...")
        
        if not self.existing_post_ids:
            self.log_result("Single Post Retrieval", False, "No existing post IDs available")
            return False
            
        post_id = self.existing_post_ids[0]
        data, error = self.make_request('GET', f'posts/{post_id}', expected_status=200, token=None)
        
        if error:
            self.log_result("Single Post Retrieval", False, error)
            return False
            
        if (data and 'id' in data and 'comment_count' in data and 
            data['id'] == post_id):
            self.log_result("Single Post Retrieval", True, f"Retrieved post with comment_count: {data['comment_count']}")
            return True
        else:
            self.log_result("Single Post Retrieval", False, "Post missing required fields")
            return False

    def test_get_post_comments(self):
        """Test GET /api/posts/{post_id}/comments"""
        print("\n💬 Testing Post Comments Retrieval...")
        
        if not self.existing_post_ids:
            self.log_result("Post Comments Retrieval", False, "No existing post IDs available")
            return False
            
        post_id = self.existing_post_ids[0]
        data, error = self.make_request('GET', f'posts/{post_id}/comments', expected_status=200, token=None)
        
        if error:
            self.log_result("Post Comments Retrieval", False, error)
            return False
            
        if isinstance(data, list):
            # Check that all comments have required fields
            all_valid = True
            for comment in data:
                if ('id' not in comment or 'author_name' not in comment or 
                    'body' not in comment or 'created_at' not in comment):
                    all_valid = False
                    break
            
            if all_valid:
                self.log_result("Post Comments Retrieval", True, f"Retrieved {len(data)} comments")
                return True
            else:
                self.log_result("Post Comments Retrieval", False, "Comments missing required fields")
                return False
        else:
            self.log_result("Post Comments Retrieval", False, "Expected array of comments")
            return False

    def test_create_comment_auth_required(self):
        """Test POST /api/posts/{post_id}/comments (auth required)"""
        print("\n✍️ Testing Comment Creation (Auth Required)...")
        
        if not self.existing_post_ids:
            self.log_result("Comment Creation Auth", False, "No existing post IDs available")
            return False
            
        if not self.user_token:
            self.log_result("Comment Creation Auth", False, "No user token available")
            return False
            
        post_id = self.existing_post_ids[0]
        comment_data = {
            "body": "This is a test comment for the posts experience feature testing."
        }
        
        data, error = self.make_request('POST', f'posts/{post_id}/comments', comment_data, 
                                      expected_status=200, token=self.user_token)
        
        if error:
            self.log_result("Comment Creation Auth", False, error)
            return False
            
        if (data and 'id' in data and 'body' in data and 
            data['body'] == comment_data['body']):
            self.test_comment_id = data['id']
            self.log_result("Comment Creation Auth", True, f"Comment created: {self.test_comment_id}")
            return True
        else:
            self.log_result("Comment Creation Auth", False, "Invalid comment creation response")
            return False

    def test_comment_rate_limiting(self):
        """Test comment rate limiting (15 second limit)"""
        print("\n⏱️ Testing Comment Rate Limiting...")
        
        if not self.existing_post_ids or not self.user_token:
            self.log_result("Comment Rate Limiting", False, "Missing post ID or user token")
            return False
            
        post_id = self.existing_post_ids[0]
        comment_data = {
            "body": "This comment should be rate limited."
        }
        
        # Try to create another comment immediately (should be rate limited)
        data, error = self.make_request('POST', f'posts/{post_id}/comments', comment_data, 
                                      expected_status=429, token=self.user_token)
        
        # Check for rate limiting response (either 429 status or error message about waiting)
        if (error and "429" in str(error)) or (data and "wait" in str(data.get('detail', '')).lower()):
            self.log_result("Comment Rate Limiting", True, "Rate limiting working correctly")
            return True
        else:
            self.log_result("Comment Rate Limiting", False, f"Expected rate limit response, got: {error or data}")
            return False

    def test_delete_comment_admin(self):
        """Test DELETE /api/comments/{comment_id} - Admin can delete"""
        print("\n🗑️ Testing Comment Deletion (Admin)...")
        
        if not self.test_comment_id or not self.admin_token:
            self.log_result("Comment Deletion Admin", False, "Missing comment ID or admin token")
            return False
            
        data, error = self.make_request('DELETE', f'comments/{self.test_comment_id}', 
                                      expected_status=200, token=self.admin_token)
        
        if error:
            self.log_result("Comment Deletion Admin", False, error)
            return False
            
        if data and data.get('message') == "Comment deleted":
            self.log_result("Comment Deletion Admin", True, "Admin successfully deleted comment")
            # Reset comment ID since it's deleted
            self.test_comment_id = None
            return True
        else:
            self.log_result("Comment Deletion Admin", False, "Unexpected deletion response")
            return False

    def test_delete_comment_author(self):
        """Test DELETE /api/comments/{comment_id} - Author can delete their own comment"""
        print("\n✂️ Testing Comment Deletion (Author)...")
        
        if not self.existing_post_ids or not self.user_token:
            self.log_result("Comment Deletion Author", False, "Missing post ID or user token")
            return False
            
        # First create a new comment
        post_id = self.existing_post_ids[0]
        comment_data = {
            "body": "This comment will be deleted by its author."
        }
        
        # Wait a bit to avoid rate limiting
        import time
        time.sleep(16)  # Wait for rate limit to reset
        
        data, error = self.make_request('POST', f'posts/{post_id}/comments', comment_data, 
                                      expected_status=200, token=self.user_token)
        
        if error:
            self.log_result("Comment Deletion Author", False, f"Failed to create comment: {error}")
            return False
            
        if not data or 'id' not in data:
            self.log_result("Comment Deletion Author", False, "No comment ID in creation response")
            return False
            
        comment_id = data['id']
        
        # Now delete it as the author
        data, error = self.make_request('DELETE', f'comments/{comment_id}', 
                                      expected_status=200, token=self.user_token)
        
        if error:
            self.log_result("Comment Deletion Author", False, error)
            return False
            
        if data and data.get('message') == "Comment deleted":
            self.log_result("Comment Deletion Author", True, "Author successfully deleted own comment")
            return True
        else:
            self.log_result("Comment Deletion Author", False, "Unexpected deletion response")
            return False

    def test_delete_comment_unauthorized(self):
        """Test DELETE /api/comments/{comment_id} - Non-author/non-admin cannot delete"""
        print("\n🚫 Testing Comment Deletion (Unauthorized)...")
        
        if not self.existing_post_ids or not self.admin_token:
            self.log_result("Comment Deletion Unauthorized", False, "Missing post ID or admin token")
            return False
            
        # Create a comment as admin first
        post_id = self.existing_post_ids[0]
        comment_data = {
            "body": "This comment will test unauthorized deletion."
        }
        
        data, error = self.make_request('POST', f'posts/{post_id}/comments', comment_data, 
                                      expected_status=200, token=self.admin_token)
        
        if error or not data or 'id' not in data:
            self.log_result("Comment Deletion Unauthorized", False, f"Failed to create test comment: {error}")
            return False
            
        comment_id = data['id']
        
        # Try to delete it as regular user (should fail)
        if not self.user_token:
            self.log_result("Comment Deletion Unauthorized", False, "No user token available")
            return False
            
        data, error = self.make_request('DELETE', f'comments/{comment_id}', 
                                      expected_status=403, token=self.user_token)
        
        if error and "403" in str(error):
            self.log_result("Comment Deletion Unauthorized", True, "Unauthorized deletion correctly blocked")
            # Clean up the comment as admin
            self.make_request('DELETE', f'comments/{comment_id}', token=self.admin_token)
            return True
        elif data and data.get('status_code') == 403:
            self.log_result("Comment Deletion Unauthorized", True, "Unauthorized deletion correctly blocked")
            # Clean up the comment as admin
            self.make_request('DELETE', f'comments/{comment_id}', token=self.admin_token)
            return True
        else:
            self.log_result("Comment Deletion Unauthorized", False, f"Expected 403 error, got: {error or data}")
            # Clean up the comment as admin
            self.make_request('DELETE', f'comments/{comment_id}', token=self.admin_token)
            return False

    def test_posts_experience_comprehensive(self):
        """Run comprehensive Posts Experience tests"""
        print("\n🎯 POSTS EXPERIENCE COMPREHENSIVE TESTING")
        print("=" * 60)
        
        posts_tests = [
            ("Posts Pagination", self.test_get_posts_pagination),
            ("Posts Search", self.test_get_posts_search),
            ("Posts Sort", self.test_get_posts_sort),
            ("Latest Posts", self.test_get_latest_posts),
            ("Single Post Retrieval", self.test_get_single_post),
            ("Post Comments Retrieval", self.test_get_post_comments),
            ("Comment Creation Auth", self.test_create_comment_auth_required),
            ("Comment Rate Limiting", self.test_comment_rate_limiting),
            ("Comment Deletion Admin", self.test_delete_comment_admin),
            ("Comment Deletion Author", self.test_delete_comment_author),
            ("Comment Deletion Unauthorized", self.test_delete_comment_unauthorized),
        ]
        
        posts_passed = 0
        posts_total = len(posts_tests)
        
        for test_name, test_func in posts_tests:
            try:
                if test_func():
                    posts_passed += 1
            except Exception as e:
                self.log_result(test_name, False, f"Exception: {str(e)}")
        
        print(f"\n📊 POSTS EXPERIENCE RESULTS: {posts_passed}/{posts_total} tests passed")
        return posts_passed == posts_total

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

    def run_posts_experience_tests(self):
        """Run Posts Experience feature tests"""
        print("🎯 POSTS EXPERIENCE TESTING")
        print("=" * 60)
        print("Testing complete Posts Experience feature...")
        
        # Reset counters for this test suite
        initial_tests_run = self.tests_run
        initial_tests_passed = self.tests_passed
        initial_failed_tests = len(self.failed_tests)
        
        # Authentication first (required for some tests)
        auth_tests = [
            ("Admin Login", self.test_admin_login),
            ("User Registration", self.test_user_registration),
            ("User Login", self.test_user_login),
        ]
        
        for test_name, test_func in auth_tests:
            try:
                test_func()
            except Exception as e:
                self.log_result(test_name, False, f"Exception: {str(e)}")
        
        # Run Posts Experience tests
        self.test_posts_experience_comprehensive()
        
        # Calculate results for this test suite
        posts_tests_run = self.tests_run - initial_tests_run
        posts_tests_passed = self.tests_passed - initial_tests_passed
        posts_failed_tests = len(self.failed_tests) - initial_failed_tests
        
        # Print final results
        print("\n" + "=" * 60)
        print(f"📊 POSTS EXPERIENCE TEST RESULTS")
        print(f"Tests Passed: {posts_tests_passed}/{posts_tests_run}")
        
        if posts_failed_tests > 0:
            print(f"\n❌ FAILED TESTS:")
            for failure in self.failed_tests[initial_failed_tests:]:
                print(f"  • {failure['test']}: {failure['details']}")
            return False
        else:
            print(f"\n✅ ALL POSTS EXPERIENCE TESTS PASSED!")
            print(f"✅ Posts pagination, search, and sort working")
            print(f"✅ Latest posts endpoint working")
            print(f"✅ Single post retrieval with comment count working")
            print(f"✅ Comment creation with authentication working")
            print(f"✅ Comment rate limiting (15 seconds) working")
            print(f"✅ Comment deletion permissions working correctly")
            return True

def main():
    """Main function to run Posts Experience tests"""
    tester = ModerationWorkflowTester()
    
    # Run the Posts Experience tests as requested
    success = tester.run_posts_experience_tests()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())