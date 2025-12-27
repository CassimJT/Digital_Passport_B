DIGITIZING MALAWI IMMIGRATION PERSONAL DETAILS COLLECTION PROCESS FOR PASSPORT MAKING 

The collection of details for citizes who want to get a passport is really heart breaking as people spend days and nights waiting to get or submit a form, which can be done easly via internet.
This project aims to eradicate such as long waiting process by building a web-based platform which integrates National Regestration Burue, and Immigration department... for smoother data collection..
       ------------------------------------------------------------------------------------------------------------------------------------------------------------------

WORK FLOW FOR THE FIRST PART OF THE PROJECT.
```js

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
					|---->Middleware (Auth, Role, ErroHandler, PassportAuth)
							|
----------------------------|-----------------------------------------------------------------	
WEEK 2, FEATURES $ DELIVERY	|
							|
							Sunday(5/10/2025)
							|
							|---->Route Wiring
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
														|---->PaymentController (9 - 10/10/2025)
																|
																Saturday (11/10/2025)
																|
																|----->Socket integration
														     			 |
														     			 Sunday (12/10/2025)
														     			 |
														     			 |--->NotificationControllers
																				|
																				Monday (13/10/2025)
																				|
																				|---->Testing $ QA
																						 |
																						 Tuesday (14/10/2025)
																						 |									
																						 |---->Deployment									
```

PARTICIPANTS OF THE PROJECT

```js
 Light Bekete														 Bryan Nathupo									
     																	|---Models									
	|---UserControllers													|---Documentation														        
	|---AuthControllers													|---Deployment                                  
																		|---Testing & QA	    							
   																		

 Titus Bokosi														CassimJT
     |---PaymentControllers												|----Project setup
     |---socket integration												|----Database connection & configuration
          																|----Route Wiring	
																		|----Testing & QA
```

ENDPOINTS / URLs 
```js

	Endpoints which client is expected to hit

	https://digital-passport-b.onrender.com/api/auth//verfy-national-id  ---user provide national-id for verification
	Method: POST

			Expected inpunts for id verification
				{
					"phone":,
					"emailAddress":,
					"nationalId":
				}

			if successfull, expected response-body
				{

				status: 200
				status: "Success"
				message:"find user id"

				},

			other expected response-bodies in terms of failure
				{

					status: 500
					status: "Failed"
					message: erro.message
				}

		
				{ 
					status: 404
					status:"failed",
	                message: "user not found"
				},

	
				{ 
					status: 200
					status:"Success",
	                message: "Ok"
				},	

			
			catch(error)
				{
					next(error)
				}
			
			
```


```js

	https://digital-passport-b.onrender.com/api/auth/register
	Method: POST

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
					}
			},

		if successfull expected response-body is
			{	
				status: 200
			 	status:"success",
           	    message: "saved user succesfully"
			},

		other expectes response-bodies

			{ 
				status: 404
				status:"failed",
                message: "Saving failed"
			},

			{
				status: "404"
				status: "failed"
				message: "OTP or validation failed"
			}

		catch(error)
			{
				next(error)
			}


```

```js
	https://digital-passport-b.onrender.com/api/auth/login
	Method: POST

		Expected inputs for logging and validation is required
			{
				"emailAddress":,
				"password":
			},

		if successful expected response-body 
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
Refreshing token
```js 
	https://digital-passport-b.onrender.com/api/auth/refresh-token
	Method: POST

		Expected inputs to refresh token
			{
				"userId":
				"tokenId":
			}

		if successfull, expected response-body
			{
				status: 200
				status: "Success"
				message: "token refreshed"
			}

		Other expected response-body
			{
				status: 404
				status: "Failed"
				status: "Faile to refresh token"
			}


		catch(error)
			{
				next(error)
			}
				
```
Request to reset password
```js
	https://digital-passport-b.onrender.com/api/auth/request-reset
	Method: POST

		Expected inputs for requesting password reset
			{
				"emailAddress":
			}

		if successfull, expected response-body
			{
				status: 200
				status: "success"
				message: "Password reset request sent to your email address"
			}

		catch(error)
			{
				next(error)
			}	


```
Resetting password, the provided password need to be validated
```js
	https://digital-passport-b.onrender.com/api/auth/reset-password
	Method: POST

		Expected inputs for resetting password
			{
				"password":,
				"comfirmPassword":
			}

		if password reset successfull, expected response-body
			{
				status:200
				status: "Success"
				message: "Password reset successfull"
			}

		other expected response-bodies
			{
				status: 404
				status: "failed"
				message: "Mismatching passwords"
			}

		catch(error)
				{
					next(error)
				}		

		
```
Changing password, the provided passwords need to be validated
```js
	https://digital-passport-b.onrender.com/api/auth/change-password
	Method: POST

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

		other expected response-bodies in terms of failure
			{
				status:400
				status: "Failed"
				message: "Mismatching passwords "
			}	

		catch(error)
				{
					next(error)
				}	

```
ENDPOINTS FOR USER OR ADMIN/ URLs

```js 

	https://digital-passport-b.onrender.com/api/users/    -----to be hit by Super Admin in order to get all users
	Method: GET

		if successfull, expected response-body
			{
				status: 200
				status: "Success"
				message: allUsers
			}

		other expected response-bodies in terms of failure
			{
				status: 404
				status: "Failed"
				message: "Not found, failed to retrieve all users"
			}

		catch(error)
			{
				next(error)
			}		
```

Getting user by id to be performed by Super Admin

```js
	https://digital-passport-b.onrender.com/api/users/:id      -----for Admin to get user by ID
	Method: GET

		Expected inputs 
			{
				"id":
			}

		if successfull, expected response-body
			{
				status: 200
				status: "Success"
				message: oneUser
			}
		other expected response-bodies in terms of failure
			{
				status: 404
				status: "Failed"
				message: "User not found"

			}

		catch(error)
			{
				next(error)
			}

	And also used to delete user

		if deleting the user successful, expected response-body
			{
				status:200
				status: "Success"
				message: "user ${userId} got deleted successfully"
			}

		other expected response-body
			{
				status: 500
				status: "Failed"
				message: "Internal server error while deleting user"
			}
	
		catch(error)
			{
				next(error)
			}			

```
Getting user profile, user will be able to get his/her profile if successful
```js
	https://digital-passport-b.onrender.com/api/users/me/profile     
	Method: GET

		Expected inputs for getting profile
			{
				"id":
			}

		if successfull, expected response-body
			{
				status: 200
				status: "Success"
				message: UserProfile
			}

		other expected response-body
			{
				status: 404
				status: "Failed"
				message: "Not found"
			}		
	
		catch(error)
			{
				next(error)
			}

	To update the UserProfile ---here user provide userId, emailAddress and residentialAddress to update the profile
		
		Expected inputs for updating UserProfile
			{
				"userId":, 
				"emailAddress":, 
				"residentialAddress":
			}

		if successfull, expected response-body
			{
				status:200
				status: "Success"
				message: 
				  	{	
           				 message:"Profile updated succesfully", 
            			 updatedProfile: user
        			}
			}

		other expected response-body
			{
				status: 400
				status: "Failed"
				message: "Invalid or empty update fields"
			}

			{
				status: "500"
				status: "Failed"
				message: "Internal server error, user not updated"
			}
			
		catch(error)
			{
				next(error)
			}	

```
Deleting user, Super admin can delete user
```js
	https://digital-passport-b.onrender.com/api/users/id

		Expected input 
			{
				"usedId": 
			}

		if successfull, expected response-body
			{
				status: 200
				status: "Success"
				message: "user ${userId} got deleted successfully"
			}

		other expected response bodies in terms of failure
			{
				status: 500
				status: "failed"
				message: "Internal server error occured while deleting the a user "
			}
		catch(error)
			{
				next(error)
			}	

```
ENDPOINTS FOR PAYMENT 
```js
	https://digital-passport-b.onrender.com/api/payments/init      ---url for initiating the payment 

		Expected inputs for payment initiation
			{
				"passportID":, 
				"passportFee ":
			}

		if successfull expected response-body 
			{
				status: 200
				status: "Success"
				message: "Checkout session created"
			}

		other expected response-bodies in terms of failure
			{
				status: 400
				status: "Failed"
				message: "passportID and fee is required"
			}	

			{
				status: 404
				status: "Failed"
				message: "Passport Data not found"
			}

			{
				status: 403
				status: "Failed"
				message: "You are not authorized to make a payment for this passport"
			}

```