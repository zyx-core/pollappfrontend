# Global Voting Ecosystem (Poll App)

A modern, containerized full-stack web application designed for interactive voting and polling, built with an Angular frontend and a .NET 8 backend, backed by MySQL.

## 🚀 Features

- **User Authentication:** Secure JWT-based registration and login system.
- **Role-Based Access Control:** Distinct roles for Voters and Administrators.
- **Admin Dashboard:** Administrators can manage teams/candidates and view real-time polling analytics.
- **Voting Interface:** Clean, intuitive interface for users to cast, view, and revoke votes.
- **Dynamic Theming:** Completely original, responsive "Matte Slate & Electric Blue" UI.
- **Containerized:** Fully Dockerized frontend, backend, and database for seamless deployment.
- **Kubernetes Ready:** Includes K8s manifests for deploying directly to Azure Kubernetes Service (AKS).

## 🛠️ Technology Stack

- **Frontend:** Angular v17+, TypeScript, SCSS, RxJS, Angular Material
- **Backend:** .NET 8, ASP.NET Core Web API, Entity Framework Core, FluentValidation, Serilog
- **Database:** MySQL 8.0
- **Containerization:** Docker & Docker Compose
- **Orchestration:** Kubernetes (manifests included)

## 🏗️ Local Development

### Prerequisites
- [Docker](https://www.docker.com/get-started) and Docker Compose installed.

### Run with Docker Compose
The easiest way to run the entire application locally is using Docker Compose.

1. Clone the repository and navigate to the root directory.
2. Run the following command:
   ```bash
   docker-compose up --build
   ```
3. The application services will be available at:
   - **Frontend:** http://localhost
   - **Backend API:** http://localhost:5000
   - **Database:** localhost:3306

### Default Admin Credentials
When the application starts, it automatically seeds an administrator account:
- **Email:** `admin@fifapoll.com`
- **Password:** `Admin@1234`

## ☁️ Kubernetes Deployment (AKS)

The application includes manifests to deploy directly into a Kubernetes cluster.

### 1. Build and Push Images
First, build your Docker images and push them to your container registry (e.g., Azure Container Registry).
```bash
# Build and Push Backend
cd backend
docker build -t <your-registry>/pollapp-backend:latest .
docker push <your-registry>/pollapp-backend:latest

# Build and Push Frontend
cd ../frontend
docker build -t <your-registry>/pollapp-frontend:latest .
docker push <your-registry>/pollapp-frontend:latest
```

### 2. Update K8s Manifests
Update `k8s/backend-deployment.yaml` and `k8s/frontend-deployment.yaml` to point to your specific container registry image paths.

### 3. Apply Manifests
Deploy the database, backend, and frontend to your cluster:
```bash
kubectl apply -f k8s/
```

### 4. Access the Application
Fetch the external LoadBalancer IP for the frontend:
```bash
kubectl get svc frontend-service
```
Navigate to the `EXTERNAL-IP` provided in your browser.

## 📁 Repository Structure

- `/frontend` - Angular source code, components, services, and frontend Dockerfile.
- `/backend` - .NET 8 Web API source code, DTOs, Controllers, and backend Dockerfile.
- `/k8s` - Kubernetes deployment and service manifests for all application tiers.
- `docker-compose.yml` - Orchestrates the entire stack for local development.
<img width="1913" height="899" alt="Screenshot 2026-06-11 195606" src="https://github.com/user-attachments/assets/d56ab2fa-ab17-4bfb-99dd-20b3348f612c" />
<img width="1919" height="963" alt="Screenshot 2026-06-11 195554" src="https://github.com/user-attachments/assets/708e5a6b-5dd8-4adb-b256-75b390cd8ba2" />
<img width="1913" height="914" alt="Screenshot 2026-06-11 195539" src="https://github.com/user-attachments/assets/6d845cd8-d6dd-4abe-84ae-9fda826af03a" />
<img width="1909" height="913" alt="Screenshot 2026-06-11 195526" src="https://github.com/user-attachments/assets/4770ca79-b874-4ddc-83da-27d72ef55003" />
<img width="1915" height="911" alt="Screenshot 2026-06-11 195514" src="https://github.com/user-attachments/assets/9f22eaf9-50a9-4633-97ff-f9992065c739" />
<img width="1840" height="768" alt="Screenshot 2026-06-11 195454" src="https://github.com/user-attachments/assets/77e1f550-4ea0-42f1-9132-bfd64f18741d" />
<img width="1900" height="895" alt="Screenshot 2026-06-11 195741" src="https://github.com/user-attachments/assets/c3edd9f4-0228-43fe-8b90-fdc6880f8107" />
<img width="1896" height="913" alt="Screenshot 2026-06-11 195716" src="https://github.com/user-attachments/assets/6479a8b3-4a3b-44c0-b55d-08230ed057d8" />
