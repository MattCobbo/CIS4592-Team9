Testing Documentation

Req ID | Backend Requirement | Key Implementation (model / module / endpoint) | Verification Method (automated test) | Coverage Status

BE-USR-001 | Create users with username, hashed password, and bio | MyUser model (models.py) | MyUserModelTest.test_user_creation | ✔ Pass

BE-USR-002 | Reject empty usernames | MyUser.full_clean() validation | MyUserModelTest.test_invalid_username | ✔ Pass

BE-USR-003 | Support follower ↔ following links between users | self-referential M2M on MyUser | MyUserModelTest | test_followers_relationship | ✔ Pass

BE-POST-001 | Persist posts with author FK and description | Post model | PostModelTest.test_post_creation | ✔ Pass

BE-POST-002 | Auto-stamp created_at on post save | Post.created_at (auto_now_add) | PostModelTest.test_auto_created_at | ✔ Pass

BE-POST-003 | Allow users to like/unlike posts | Post.likes M2M | PostModelTest.test_post_likes | ✔ Pass

BE-ORG-001 | Create organisations with unique name, bio, owner | Organization model | OrganizationModelTest.test_organization_creation, test_unique_organization_name | ✔ Pass

BE-ORG-002 | Add and remove members | Organization.members M2M | OrganizationModelTest.test_add_member_to_organization, test_remove_member_from_organization | ✔ Pass

BE-ORG-003 | Track pending membership requests | Organization.pending_requests M2M | OrganizationModelTest.test_pending_requests | ✔ Pass

BE-ORG-004 | Provide readable string form | Organization.__str__ | OrganizationModelTest.test_organization_str_method | ✔ Pass

BE-OPST-001 | Support org-affiliated posts and personal posts | orgPost model (organization FK nullable) | OrgPostModelTest.test_org_post_creation, test_personal_post_creation | ✔ Pass

BE-OPST-002 | Flag whether a post belongs to an organisation | orgPost.is_organization_post() | OrgPostModelTest.test_is_organization_post_method | ✔ Pass

BE-OPST-003 | Like/unlike organisation posts | orgPost.likes M2M | OrgPostModelTest.test_org_post_likes | ✔ Pass

BE-OPST-004 | Human-readable string for both org and personal posts | orgPost.__str__ | OrgPostModelTest.test_org_post_str_method, test_personal_post_str_method | ✔ Pass

BE-EVT-001 | Create events tied to an organisation with future start date | Event model | EventModelTest.test_event_creation | ✔ Pass

BE-EVT-002 | Provide formatted title-date string | Event.__str__ | EventModelTest.test_event_str | ✔ Pass

BE-ATT-001 | Record single RSVP per user per event | EventAttendance through modelMeta.unique_together | EventAttendanceModelTest.test_single_attendance_row, test_unique_together_enforced | ✔ Pass

BE-JOB-001 | Post jobs with title, description, pay, auto-timestamp | Job model | JobModelTest.test_job_creation | ✔ Pass

BE-JOB-002 | Readable job summary string | Job.__str__ | JobModelTest.test_job_str | ✔ Pass

BE-APP-001 | Submit job applications with applicant data and timestamp | JobApplication model | JobApplicationModelTest.test_application_creation | ✔ Pass

BE-APP-002 | Readable application summary string | JobApplication.__str__ | JobApplicationModelTest.test_application_str | ✔ Pass

BE-AUTH-001 | Allow valid login requests | login endpoint (views.py / authenticate.py) | Indirectly exercised in LoginThrottleTest (first two posts succeed) | ✔ Pass

BE-AUTH-002 | Enforce login-rate limit of 2 requests per minute | LoginThrottle (throttling.py) | LoginThrottleTest.test_login_throttle_allows_within_limit, test_login_throttle_resets_after_time | ✔ Pass

The project is exercised by an automated suite that lives in base/tests.py and by continuous manual interaction with the React front end during day-to-day development. Running

bash
Copy
Edit
python manage.py test
spins up an in-memory SQLite database, loads the full Django application, and drives every test class below, giving us a deterministic walk through model logic, authentication code, URL routing, and the custom throttle that protects the login endpoint.

Backend Testing
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

Automated Use cases

Auto ID | Requirement(s) | Python Method (module :: class :: function) | Purpose / Assertion Summary
AUT-USR-01 | BE-USR-001 | tests.py :: MyUserModelTest :: test_user_creation | Confirms create_user saves username, bio and hashed password.

AUT-USR-02 | BE-USR-003 | tests.py :: MyUserModelTest :: test_followers_relationship | Adds follower, checks symmetry of followers ↔ following.

AUT-USR-03 | BE-USR-002 | tests.py :: MyUserModelTest :: test_invalid_username | Calls full_clean() on empty username → expects ValidationError.

AUT-POST-01 | BE-POST-001 | tests.py :: PostModelTest :: test_post_creation | Verifies author FK and description persist.
AUT-POST-02 | BE-POST-003 | tests.py :: PostModelTest :: test_post_likes | Adds like, ensures Many-to-Many row exists.

AUT-POST-03 | BE-POST-002 | tests.py :: PostModelTest :: test_auto_created_at | Checks created_at populated by auto_now_add.

AUT-ORG-01 | BE-ORG-001 | tests.py :: OrganizationModelTest :: test_organization_creation | Confirms fields and timestamp on save.

AUT-ORG-02 | BE-ORG-001 | tests.py :: OrganizationModelTest :: test_unique_organization_name | Attempts duplicate name → expects ValidationError.

AUT-ORG-03 | BE-ORG-004 | tests.py :: OrganizationModelTest :: test_organization_str_method | Ensures __str__ returns org name.

AUT-ORG-04 | BE-ORG-002 | tests.py :: OrganizationModelTest :: test_add_member_to_organization | Adds member, asserts membership list updated.

AUT-ORG-05 | BE-ORG-003 | tests.py :: OrganizationModelTest :: test_pending_requests | Adds pending request, checks pending list.

AUT-ORG-06 | BE-ORG-002 | tests.py :: OrganizationModelTest :: test_remove_member_from_organization | Removes member, list no longer contains user.

AUT-OPST-01 | BE-OPST-001 | tests.py :: OrgPostModelTest :: test_org_post_creation | Saves org-affiliated post; verifies FK and timestamp.

AUT-OPST-02 | BE-OPST-001 | tests.py :: OrgPostModelTest :: test_personal_post_creation | Saves personal post (organization=None).

AUT-OPST-03 | BE-OPST-002 | tests.py :: OrgPostModelTest :: test_is_organization_post_method | Returns True/False appropriately.

AUT-OPST-04 | BE-OPST-004 | tests.py :: OrgPostModelTest :: test_org_post_str_method | Checks string for org post.

AUT-OPST-05 | BE-OPST-004 | tests.py :: OrgPostModelTest :: test_personal_post_str_method | Checks string for personal post.

AUT-OPST-06 | BE-OPST-003 | tests.py :: OrgPostModelTest :: test_org_post_likes | Adds like to org post, verifies M2M.

AUT-EVT-01 | BE-EVT-001 | tests.py :: EventModelTest :: test_event_creation | Confirms future start date, FK links, timestamp.

AUT-EVT-02 | BE-EVT-002 | tests.py :: EventModelTest :: test_event_str | Checks formatted title-date string.

AUT-ATT-01 | BE-ATT-001 | tests.py :: EventAttendanceModelTest :: test_single_attendance_row | Creates RSVP, validates reverse relations.

AUT-ATT-02 | BE-ATT-001 | tests.py :: EventAttendanceModelTest :: test_unique_together_enforced | Attempts duplicate RSVP → expects IntegrityError.

AUT-JOB-01 | BE-JOB-001 | tests.py :: JobModelTest :: test_job_creation | Checks job fields and auto post_date.

AUT-JOB-02 | BE-JOB-002 | tests.py :: JobModelTest :: test_job_str | Ensures human-readable job string.

AUT-APP-01 | BE-APP-001 | tests.py :: JobApplicationModelTest :: test_application_creation | Saves application, confirms applicant data & timestamp.

AUT-APP-02 | BE-APP-002 | tests.py :: JobApplicationModelTest :: test_application_str | Checks readable application summary string.

AUT-AUTH-01 | BE-AUTH-002 | tests.py :: LoginThrottleTest :: test_login_throttle_allows_within_limit | Sends two logins, expects 200/201 (not 429).

AUT-AUTH-02 | BE-AUTH-002 | tests.py :: LoginThrottleTest :: test_login_throttle_resets_after_time | Exceeds limit, expects 429 Too Many Requests.


Manual ID | Requirement(s) | Goal & Preconditions | Step-by-Step Actions | Expected Outcome
TC-USR-01 | BE-USR-001 | Register & log in new user; no active session | 1. Open /register 2. Fill username=dave, strong pwd, bio 3. Submit 4. Log in with same creds | Redirect to /home; navbar shows “dave”.

TC-USR-02 | BE-USR-002 | Reject blank username | Same page | Leave username empty, submit

TC-USR-03 | BE-USR-003 | Follow user workflow (U1→U2) | Users U1 & U2 logged in diff browsers | U1 visits U2’s profile, clicks Follow

TC-POST-01 | BE-POST-001/002 | Create new post | U1 logged in | Click New Post, type text, submit

TC-POST-02 | BE-POST-003 | Like/unlike post | U2 logged in, sees U1 post | Click Like, counter +1; click again, counter –1.

TC-ORG-01 | BE-ORG-001 | Owner creates unique org | U3 logged in | Org page → Create → “DevOps Hub” → submit

TC-ORG-02 | BE-ORG-002 | Add & remove member | U2 requests to join ORG1; Owner U1 approves then removes | Membership list updates accordingly.

TC-ORG-03 | BE-ORG-003 | Pending requests flow | Same scenario before approval | Owner sees U2 in pending queue; count decrements after approval.

TC-OPST-01 | BE-OPST-001/002 | Create org-scoped post | U1 inside ORG1 | Org Post → enter text → submit

TC-OPST-02 | BE-OPST-004 | Personal post string | Open personal post detail via API | Response string includes “Unknown Organization”.

TC-EVT-01 | BE-EVT-001/002 | Event creation & RSVP | U1 creates event, U2 RSVPs “Going” | Event list updates; U2 avatar appears; card shows formatted date.

TC-EVT-02 | BE-ATT-001 | Prevent duplicate RSVP | U2 already “Going” | U2 selects another RSVP option

TC-JOB-01 | BE-JOB-001/002 | Post job listing | U3 on Job Board | New Job → fill form → submit

TC-APP-01 | BE-APP-001/002 | Apply to job | U2 opens JOB1 → Apply → submit | Success toast; creator sees new applicant in list.

TC-AUTH-THROTTLE-01 | BE-AUTH-002 | Confirm throttle | cURL three POSTs <60 s | Third response HTTP 429 with Retry-After header.