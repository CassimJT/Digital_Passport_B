DIGITIZING MALAWI IMMIGRATION PERSONAL DETAILS COLLECTION PROCESS FOR PASSPORT MAKING 

The collection of details for citizes who want to get a passport is really heart breaking as people spend days and nights waiting to get or summit a form, which can be done easly via internet.
This project aims to eradicate such as long waiting process by building a web-based platform which integrates National Regestration Burue, and Immigration department... for smoother data collection..
       --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

WORK FLOW FOR THE FIRST PART OF THE PROJECT.
<pre>
WEEK 1, FOUNDATION

Wednesday (1/10/2025)
|
|------>project setup
	|
	Thursday (2 - 4/10/2025)
	|
	|----->Database Connection and Configuration
	|		|
	|-------|------>Utils(Validators,JWT, and Helpers, SMSSender,EmailSender) [ ]
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
--------------------------------|-----------------------------------------------------------------	
WEEK 2, FEATURES $ DELIVERY		|
								|
								Sunday(5/10/2025)
								|
								|----->Route Wiring
										|
										Monday(6/10/2025)
										|
										|------->AuthCOntrollers (6 - 7/10/2025)
													|
													|
													Wedsneday (8/10/2025)	
													|
													|------>UserControllers
															|
															Thursday(9/10/2025)
															|
															|------>PaymentController (9 - 10/10/2025)
																		|
																		Saturday (11/10/2025)
																		|
																		|------>Socket integration
														     						|
														     						Sunday (12/10/2025)
														     						|
														     						|------>NotificationControllers
																							|
																							Monday (13/10/2025)
																							|
																							|------>Testing $ QA
																										|
																										Tuesday (14/10/2025)
																										|									
																										|------->Deployment									
</pre>

PARTICIPANTS OF THE PROJECT

 <pre>
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
</pre>