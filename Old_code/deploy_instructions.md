# Deployment Instructions for AWS

Based on your request, here is a complete guide to deploying the Indian aesthetic Hotel Khalsa Punjab website to AWS using an EC2 instance for the backend and an S3 bucket for the frontend.

## 1. Deploying Frontend to S3 (Static Hosting)

1. **Build the production bundle:**
   Open your terminal in the `frontend` folder and run:
   ```bash
   npm run build
   ```
   *This will generate a `dist` folder containing the optimized static HTML, CSS, JS, and images.*

2. **Configure S3 Bucket:**
   - Log into your AWS Console and navigate to **S3**.
   - Create a new bucket (e.g., `hotel-khalsa-punjab-website`). Uncheck "Block all public access" to make the site accessible.
   - Go to the bucket **Properties** and enable **Static website hosting**. Specify `index.html` as both the Index and Error document.
   - Go to **Permissions -> Bucket Policy** and add the policy to allow `s3:GetObject` publicly:
     ```json
     {
         "Version": "2012-10-17",
         "Statement": [
             {
                 "Sid": "PublicReadGetObject",
                 "Effect": "Allow",
                 "Principal": "*",
                 "Action": "s3:GetObject",
                 "Resource": "arn:aws:s3:::<your-bucket-name>/*"
             }
         ]
     }
     ```

3. **Upload Files:**
   - Upload the contents of the `frontend/dist` folder directly to the root of your S3 bucket.
   - Your frontend is now deployed at the S3 bucket's "Bucket website endpoint" URL.

---

## 2. Deploying Backend to EC2

1. **Launch EC2 Instance:**
   - Go to **EC2** in AWS console, launch a new instance (Ubuntu Server is recommended, t2.micro for free tier).
   - In **Security Groups**, allow inbound traffic on **SSH (Port 22)** and **Custom TCP (Port 5000)** (or port 80/443 if you set up Nginx later).

2. **Connect and Install Dependencies:**
   - SSH into the instance: `ssh -i key.pem ubuntu@<ec2-ip-address>`
   - Install Node.js and NPM:
     ```bash
     sudo apt update
     sudo apt install nodejs npm -y
     ```

3. **Transfer Backend Code:**
   - Use SCP or GitHub to transfer the `backend` folder to your EC2 instance. (Note: Do not transfer the `node_modules` folder, only the source code and `package.json`).

4. **Start the API Server:**
   - Inside the `backend` directory on your EC2 instance, install modules and start the server using PM2 (a production process manager):
     ```bash
     npm install
     sudo npm install -g pm2
     pm2 start server.js --name "hotel-backend"
     pm2 save
     pm2 startup
     ```

5. **Update Frontend API URL:**
   - Before building your frontend (Step 1 above), make sure to update the API endpoints in `frontend/src/pages/Booking.jsx` from `http://localhost:5000/api/bookings` to your **EC2 Public IP address** (e.g., `http://<ec2-ip>:5000/api/bookings`).
