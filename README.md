
# LiteWrite - Blogging Platform

LiteWrite is a modern blogging platform built with a powerful stack, allowing users to manage their blog posts, subscribe to premium content, and interact with comments. Whether you're a free user or a premium user, LiteWrite provides an intuitive experience for creating, editing, and viewing posts.

## Features

-   **Blog Post Management:**
    
    -   Create, Edit, and Delete blog posts.
        
    -   Save blog posts as drafts.
        
    -   Publish and unpublish posts.
        
-   **Premium Content Access:**
    
    -   Premium users can view full premium posts.
        
    -   Free users can only view snippets of premium posts.
        
-   **Commenting System:**
    
    -   Create, Edit, and Delete your own comments on any post.
        
-   **User Management:**
    
    -   Users can subscribe to a premium plan for additional features.
        

## Tech Stack

-   **Frontend:** React, TanStack (React Query), Tailwind CSS
    
-   **Backend:** PHP Laravel Sail
    
-   **Database:** MySQL
    
-   **Containerization:** Docker
    

## Getting Started

### Prerequisites

-   Docker and Docker Compose installed on your machine.
    
-   Node.js and npm for the frontend.
    
-   Composer for PHP dependencies (Laravel Sail uses Composer).
    

### Installation

#### 1. Clone the repository:

bash

CopyEdit

`git clone https://github.com/your-username/litewrite.git cd litewrite` 

#### 2. Run all the applciations:

```bash
   make run 
```
This will start the Docker containers, including the frontend application, MySQL database and the PHP Laravel server.

#### 3. Migrate the database:

Make sure your database is set up correctly by running the migrations:

```bash
docker-compose exec app sail artisan migrate
```

#### 5. Access the application:

-   **Frontend:** Open your browser and navigate to `http://localhost:5173`.
    
-   **Backend:** The backend API is available at `http://localhost:8000`.
    

### Environment Configuration

You can configure the environment variables in the `.env` file in both the frontend and backend directories. Make sure to set up your database credentials, mail server, and any other necessary environment variables.

## Usage

-   **Free Users:** Can create, view, and comment on posts. They can only see snippets of premium posts.
    
-   **Premium Users:** Can access full premium posts and enjoy other premium benefits.
    
-   **Admins:** Can manage posts, comments, and user subscriptions.
    

## Contributing

1.  Fork the repository.
    
2.  Clone your fork.
    
3.  Create a new branch (`git checkout -b feature-branch`).
    
4.  Commit your changes (`git commit -am 'Add new feature'`).
    
5.  Push to the branch (`git push origin feature-branch`).
    
6.  Open a pull request.
    

## License

This project is licensed under the MIT License - see the LICENSE file for details.