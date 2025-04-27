4.4 Testing Documentation
The project is exercised by an automated suite that lives in base/tests.py and by continuous manual interaction with the React front end during day-to-day development. Running

bash
Copy
Edit
python manage.py test
spins up an in-memory SQLite database, loads the full Django application, and drives every test class below, giving us a deterministic walk through model logic, authentication code, URL routing, and the custom throttle that protects the login endpoint.

4.4.1 Backend Testing
1. MyUserModelTest
setUp creates two users (user1, user2) with the custom create_user manager.

test_user_creation
What it tests: persistence of username, bio, and the hashed password.
Why it’s important: proves create_user sets all fields correctly and that Django’s password-hashing stack is invoked.

test_followers_relationship
What it tests: adding user2 to user1.followers and observing symmetry in user2.following.
Why it’s important: validates the self-referential Many-to-Many join table and both forward and reverse descriptors.

test_invalid_username
What it tests: calling full_clean() on a user whose username is an empty string.
Why it’s important: confirms custom validation rules surface a ValidationError and prevent invalid rows entering the database.

2. PostModelTest
setUp creates a user and an associated post.

test_post_creation
What it tests: correct foreign-key link to the author and persistence of the description.
Why it’s important: ensures the relationship between Post and MyUser is intact.

test_post_likes
What it tests: adding a second user to post.likes.
Why it’s important: shows the Many-to-Many “likes” relation inserts and retrieves rows properly.

test_auto_created_at
What it tests: presence of created_at immediately after save.
Why it’s important: confirms auto_now_add timestamps posts on creation.

3. OrganizationModelTest
setUp creates an owner, a member, a pending user, and one organisation.

test_organization_creation
What it tests: correct name, bio, owner, and auto-timestamp.
Why it’s important: verifies basic field persistence.

test_unique_organization_name
What it tests: duplicate name triggers ValidationError.
Why it’s important: proves the model’s unique=True constraint is enforced.

test_organization_str_method
What it tests: str(org) returns the organisation’s name.
Why it’s important: aids logging and debugging.

test_add_member_to_organization
What it tests: adding a user to members.
Why it’s important: confirms membership management via Many-to-Many works.

test_pending_requests
What it tests: adding a user to pending_requests.
Why it’s important: validates the join-request workflow.

test_remove_member_from_organization
What it tests: removing a user from members.
Why it’s important: proves membership can be revoked cleanly.

4. OrgPostModelTest
setUp stores one post tied to an organisation and one personal post.

test_org_post_creation
What it tests: persistence of user, organisation, description, and timestamp.
Why it’s important: confirms dual-foreign-key relationships save correctly.

test_personal_post_creation
What it tests: a post with organization=None persists.
Why it’s important: ensures nullable org field is handled gracefully.

test_is_organization_post_method
What it tests: truthiness of is_organization_post().
Why it’s important: distinguishes org posts from personal posts in business logic.

test_org_post_str_method and test_personal_post_str_method
What they test: both branches of __str__, with and without an organisation.
Why they’re important: guarantee readable strings under all conditions.

test_org_post_likes
What it tests: liking an org-affiliated post.
Why it’s important: proves Many-to-Many likes function inside this subclass.

5. EventModelTest
setUp creates a future-dated event for one organisation.

test_event_creation
What it tests: all fields plus future-date logic.
Why it’s important: validates temporal correctness and auto-timestamping.

test_event_str
What it tests: formatted title-plus-date string.
Why it’s important: assures human-readable representation for logs and notifications.

6. EventAttendanceModelTest
setUp creates two users, an organisation, and one event.

test_single_attendance_row
What it tests: creating one RSVP row and reading via both reverse relations.
Why it’s important: proves through-model integrity and bidirectional access.

test_unique_together_enforced
What it tests: attempting a duplicate RSVP raises IntegrityError.
Why it’s important: confirms the composite uniqueness constraint prevents data corruption.

7. JobModelTest
setUp stores a job posting.

test_job_creation
What it tests: persistence of creator, title, pay, and auto-timestamp.
Why it’s important: ensures hiring data is saved correctly.

test_job_str
What it tests: readable string “<title> posted by <user>”.
Why it’s important: aids admin views and logging.

8. JobApplicationModelTest
setUp creates a job and one application to that job.

test_application_creation
What it tests: links back to the job, stores applicant data, and stamps application_date.
Why it’s important: proves the application pipeline persists all critical fields.

test_application_str
What it tests: summary line referencing applicant and job title.
Why it’s important: verifies helpful stringification for recruiters.

9. LoginThrottleTest
setUp resolves the login URL and creates a test user.

test_login_throttle_allows_within_limit
What it tests: two consecutive logins succeed under the rate limit.
Why it’s important: ensures legitimate users are not wrongly throttled.

test_login_throttle_resets_after_time
What it tests: a third login within the window returns HTTP 429 Too Many Requests.
Why it’s important: demonstrates the custom LoginThrottle enforces rate-limiting and integrates with DRF’s exception handling.

Running this suite instantiates, validates, mutates, and stringifies every data model; forces each Many-to-Many table to insert and remove rows; asserts composite uniqueness; executes the password-hashing stack; resolves the critical authentication route; triggers the login serializer; and exercises every public method of LoginThrottle. The only backend paths still outside automated coverage are serializers and viewsets for content-creation endpoints—work that is planned for a future sprint.

4.4.2 Frontend Manual Testing
Manual testing accompanies every development session. After starting both servers with npm start and python manage.py runserver, a tester creates an account through the registration form, confirming client-side validation and server-side user creation. Navigating to the profile page, the tester creates a post via the Create Post dialog and verifies that the new post appears instantly on the profile timeline and on the global home feed, proving the React Query cache updates and the API endpoint respond correctly.

Next, the tester selects Organizations in the navbar, uses the Create Organization form to enter a name and description, and confirms that the new group appears in the organisation list. Clicking into that group’s profile, the tester publishes an organisation-scoped post and confirms its appearance both on the organisation feed and on the aggregated organisation-feed panel on the home page. The same session covers event creation: clicking Create Event opens a dialog that captures name, description, and date; saving the form adds the event to the organisation feed with radio-button RSVP controls that switch among “going,” “maybe,” and “not going,” confirming state persists and re-renders.

Permission boundaries are then checked by opening an organisation founded by another user. The page initially hides its content until the tester clicks Request Access and the owner approves, thereby validating the pending-membership workflow. Search functionality is exercised by typing partial usernames and organisation names into the global search bar and confirming that matching items appear in the dropdown.

Finally, the tester navigates to the Job Board, filters postings by salary range, opens an existing job, and submits an application. A second browser session logged in as the job creator refreshes the applicants list and sees the new applicant, proving that the creation and retrieval endpoints and the WebSocket refresh logic all function in concert. Repeating this routine whenever significant UI code changes ensures that hot-reloaded components, React Router navigation, and REST interactions remain stable even before Cypress-based end-to-end automation is added.