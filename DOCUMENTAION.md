DIGITIZING MALAWI IMMIGRATION PERSONAL DETAILS COLLECTION PROCESS FOR PASSPORT MAKING 

The collection of details for citizes who want to get a passport is really heart breaking as people spend days and nights waiting to get or submit a form, which can be done easly via internet.
This project aims to eradicate such as long waiting process by building a web-based platform which integrates National Regestration Burue, and Immigration department... for smoother data collection..
       --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

WORK FLOW FOR THE FIRST PART OF THE PROJECT.
<pre>

WEEK 1, FOUNDATION

Wednesday (1/10/2025)
|
|---|--->project setup
	|
	Thursday (2 - 4/10/2025)
	|
	|----->Database Connection and Configuration
	|		|
	|-------|------>Utils(Validators,JWT, and Helpers, SMSSender,EmailSender) 
		    |
		    Friday(3/10/2015)
		 	|
			|----->Models(User, NRB,Payent, Notification, Immigration)
					|
					|
					Saturday(4/10/2025)
					|
					|----->Middleware (Auth, Role, ErroHandler, PassportAuth)
							|
----------------------------|-----------------------------------------------------------------	
WEEK 2, FEATURES $ DELIVERY	|
							|
							Sunday(5/10/2025)
							|
							|----->Route Wiring
									|
									Monday(6/10/2025)
									|
									|----->AuthCOntrollers (6 - 7/10/2025)
												|
												|
												Wedsneday (8/10/2025)	
												|
												|----->UserControllers
															|
															Thursday(9/10/2025)
															|
															|----->PaymentController (9 - 10/10/2025)
																	  |
																	  Saturday (11/10/2025)
																	  |
																	  |----->Socket integration
														     					|
														     					Sunday (12/10/2025)
														     					|
														     					|----->NotificationControllers
																						|
																						Monday (13/10/2025)
																						|
																						|----->Testing $ QA
																								  |
																								  Tuesday (14/10/2025)
																								  |									
																								  |------->Deployment									
</pre>

PARTICIPANTS OF THE PROJECT

 ```js
 Light Bekete														 Bryan Nathupo									
     																	|---Models									
	|---UserControllers													|---Documentation														        
	|---AuthControllers													|---Deployment                                  
																		|--Testing & QA	    							
   																		

 Titus Bokosi														CassimJT
     |---PaymentControllers												|----Project setup
     |---socket integration												|----Database connection & configuration
          																|----Route Wiring	
																		|----Testing & QA
```

ENDPOINTS / URLs 
```js

	Endpoints which client is expected to hit

	URL :http://localhost:5000/api/auth//verfy-national-id  ---user provide national-id for verification
	Method: POST

	Expected inpunts for id verification
		{
			"phone":,
			"emailAddress":,
			"nationalId":
		}

	if successfull: expected response-body
			{

			status: 200
			status: "Success"
			message:"find user id"

			},

	if not successful
			{

				status: 500
				status: "Failed"
				message: erro.message
			}	
			

			

	    if(citizenPhone && emailNOtFound)
				
			{

			status: 404
			status: "Failed"
			message:"Email and number for verification not availabe with NRB, meet NRB personel"

			},

			OTP
		if(citizenOtpNotSaved)
			{

				status: 400
				status: "Failed"
				message: "Saving OTP details failed"
			}

		if(citizenOtpNotSent)
			{

				status: 400
				status: "Failed"
				message: "Sending otp to citizen email failed"
			},
		else
			catch(error)
				{
					next(error)
				}
			
			
	```


```js

	http://localhost:5000/api/auth/register

		Expected inputs for registration 
			{
				"nationalId":,
				"password":,
				"emailAddress":,
				"residentialAddress"
				{
					"district":,
      				"traditionalauthority": ,
      				"village":
				}:
			},

		if successful expected response-body is
			{	
				status: 200
			 	status:"success",
           	    message: "saved to db succesfully"
			},

		if citizen not saved expected response-body
			{ 
				status: 400
				status:"failed",
                message: "citizen was not saved in db"
			},
		else
			catch(error)
			{
				next(error)
			}
			

```


```js
	http://localhost:5000/api/auth/login

		Expected inputs for logging
			{
				"emailAddress":,
				"password":
			},

		if successful expected response-body is
			{	
				status: 200
			 	status:"success",
	            message: "Logged in"
			},
		if creditials not correct expected response-body
			{
				status: 400
				status: "Failed"
				message: "incorrect username/password"
			}	
		else
			catch(error)
			{
				next(error)
			}
```

```js
	http://localhost:5000/api/auth/request-reset

		Expected inputs for requesting password reset
			{
				"emailAddress":
			}

		if password reset details not sent to emailAddress , expected response-body
			{
				status: 500
				status: "failed"
				message: "Internal server error"
			}
		if password resent details sent to emailAddress, expected response-body
			{
				status: 200
				status: "success"
				message: "Password reset request sent to your email address"
			}
		else
			catch(error)
				{
					next(error)
				}	


```

```js
	http://localhost:5000/api/auth/reset-password

		Expected inputs for resetting password
			{
				"password":	
			}

		if password reset successfull, expected response-body
			{
				status:200
				status: "Success"
				message: "Password reset successfull"
			}

		if password reset failed, expected response-body
			{
				status: 500
				status: "Success"
				message: "Internal server error"
			}

		else
			catch(error)
				{
					next(error)
				}		

		
```

```js
	http://localhost:5000/api/auth/change-password

		Expected inputs for changing password
			{
				"currentPassword":, 
				"newPassword":,
				"confirmNewPassword":
			}

		if password reset successfull, expected response-body
			{
				status:200
				status: "Success"
				message: "Password updated successfully"
			}

		if password mismatch, expected response-body
			{
				status:500
				status: "Failed"
				message: "Mismatching passwords "
			}	

		if password fails to be update in the database , expected response-body
			{
				status:500
				status: "Failed"
				message: "Failed to reset their password in user db"
			}
		else
			catch(error)
				{
					next(error)
				}	

```