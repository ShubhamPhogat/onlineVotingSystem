Real-Time Voting and Ranking System  
This project is a real-time voting and ranking system where voters can score participants on a scale of 1 to 100.
The system dynamically updates participant rankings based on their total scores and ensures fairness by considering
only the latest vote from each voter. The system is designed to be scalable, efficient, and user-friendly.  

Features  
Real-Time Updates: 

Participants' ranks are updated in real-time using WebSocket and Pub/Sub. 

Voters can see the impact of their votes immediately.  

Dynamic Ranking:  

Participants' ranks are dynamically adjusted based on their total scores. 

Only the latest vote from each voter is considered to prevent manipulation. 

Scalability:  

The system is designed to handle high user traffic using Pub/Sub and WebSocket. 

The database is normalized for efficient querying and data management. 

User-Friendly Interface:  

Debouncing and prefix matching are implemented for a smoother user experience. 

Forms are validated to ensure correct data input.  

Robust Backend:  

HTTP servers handle REST API calls for fetching data.  

The system is scalable and robust, leveraging modern architectural patterns.  

Technologies Used  
Frontend:  

React (for building the user interface).  

WebSocket (for real-time communication).  

Backend:  

Node.js and Express (for REST APIs). 

WebSocket (for real-time communication). 

Pub/Sub (for publishing real-time updates). 

Database:  

PostgreSQL (normalized tables for efficient data management). 

Other Tools:

Axios (for making HTTP requests). 

Debouncing and prefix matching (for a better user experience). 

Setup Instructions  
Prerequisites  
Node.js (v16 or higher). 

PostgreSQL (v12 or higher).  

For Bootsraping the project  

1. git clone the project  
 to start backen    
. cd server  
. run npm install  
. make a .env file  
.  copy the .env.example content in .env file
    to start frontend
   cd client
    run npm install 
. make a .env file
copy the .env.example content in .env file  
   
  
IMAGES OF THE PROJECT  
![Screenshot 2025-02-27 234047](https://github.com/user-attachments/assets/933e4dd0-2c96-4e36-b8ce-f9290036262b)  
![Screenshot 2025-02-27 234055](https://github.com/user-attachments/assets/cb9429fb-7964-4f6d-b607-fa9d53fa4837)  
![Screenshot 2025-02-27 234119](https://github.com/user-attachments/assets/359fea7b-3730-46ea-a6a8-e47d415f0f18)  
![Screenshot 2025-02-27 234129](https://github.com/user-attachments/assets/7b5a083c-5898-4380-84d3-c5e7cfb60fa3)  
![Screenshot 2025-02-27 234145](https://github.com/user-attachments/assets/5b984a57-c178-4429-a1d2-cc26fdaa227f)




