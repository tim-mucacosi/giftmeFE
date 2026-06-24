In *RegisterForm* user enters:
    1. Full name
    2. Email
    3. Password
This trigger the API POST call to backend endpoint */register*
API creates user and sends the confirmation mail to email address provided in registration form.
When user goes there, and clicks Confirm, that will redirect user to route called */verify-email*
and provides user token as query param.
That token will be sent to API, to */verify-email* endpoint and the API will get that as confirmation and store it in database.
User will be redirected to *login* route.
