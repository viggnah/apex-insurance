### 1. Scenario: "ApexSure Digital Portal"

**The User Journey:**

1. **Login/Dashboard:** The user logs in and sees a modern dashboard. It's empty, prompting them to "Protect your Future".
2. **Product Selection:** They click "Get Insured" and select "Life Insurance".
3. **Smart Wizard:** Instead of a long form, they answer 3 simple questions (Name, ID, Coverage Amount).
4. **The "Magic" Moment:** When they hit "Get Policy":
* The App shows a **Live Status Stepper**:
* *Step 1: Analyzing Risk Profile (Calling REST Service)...*
* *Step 2: Risk Approved. Generating Policy (Transforming JSON to SOAP)...*
* *Step 3: Syncing with Legacy Core (Protocol Bridging)...*

* *This explicitly tells the audience what the ESB is doing behind the scenes.*

5. **Success:** A digital policy card appears instantly with a "Download PDF" button.


### 2. Prompt for Coding LLM

---

**SYSTEM PROMPT / CONTEXT:**
You are an expert solution architect for WSO2 technologies. I need a comprehensive demo kit for "ApexSure Insurance". The goal is to show a modern, "InsurTech" style frontend connecting to a legacy backend via WSO2 integration.

**REQUIREMENTS:**
Generate code for the following 4 components.

**1. The Backend Mocks (Node.js)**
*File: `backend-mocks.js*`

* Use `express` on port 3000.
* **SOAP Mock:** POST `/soap/policy`. Accepts XML. Returns `<Policy><Id>POL-{random}</Id><Status>Active</Status></Policy>`.
* **Risk Mock:** GET `/risk/{id}`.
* ID "1111" -> `{ "score": 850, "riskLevel": "Low" }`
* ID "2222" -> `{ "score": 500, "riskLevel": "High" }`



**2. The Integration Service (Ballerina)**
*File: `policy_integration.bal*`

* **Listener:** Port 9090.
* **Resource:** `POST /policy`.
* **Logic:**
1. **Log:** Print "Received Request for {name}".
2. **Risk Check:** Call `http://localhost:3000/risk/{nationalId}`.
3. **Branching:**
* If `score > 700`: Transform JSON to XML -> Call SOAP Mock -> Transform XML response to JSON.
* If `score <= 700`: Return `{ "status": "Referred", "reason": "High Risk" }`.


4. **Response:** Return `{ "policyId": "...", "status": "Active", "premium": "..." }`.



**3. The API Definition (OpenAPI)**
*File: `apex-api.yaml*`

* Standard OpenAPI 3.0 definition for the `/policy` endpoint.

**4. The Frontend App (React + Tailwind CSS)**

* **Goal:** A "Rich" User Experience. Do not use a simple form.
* **Tech:** Single file `App.js` (assume `create-react-app` structure). Use **Tailwind CSS** classes for styling (assume Tailwind is configured or add a CDN link in the index.html note).
* **Features:**
* **State 1: Dashboard.** A clean card showing "Welcome, User". A big prominent button: "+ Get New Coverage".
* **State 2: The Wizard.** A modal or centered card.
* Input: Name, National ID, Coverage Amount.
* Button: "Analyze & Issue".


* **State 3: "The Processor".** This is critical. While waiting for the API response, show a **Step-by-Step Progress Indicator** to visualize the ESB work:
* *☐ Verifying Identity...* (Check after 500ms)
* *☐ Assessing Risk Score...* (Check after 1s)
* *☐ Connecting to Legacy Core...* (Check after 1.5s)


* **State 4: Success.** Confetti effect (optional, or just a nice green badge). Show the "Policy Certificate" with the ID returned from the backend.



**INSTRUCTIONS:**

* Make the React UI look modern and professional (blue/white color scheme, rounded corners, shadows).
* Include comments in the Ballerina code explaining *exactly* where "Transformation" and "Routing" happen so I can point to it during the demo.
* Provide a "Run Guide" at the end.

---