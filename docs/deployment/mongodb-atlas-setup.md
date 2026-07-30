# MongoDB Atlas Setup Guide

1. Create a free M0 or M10 cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Go to **Database Access** -> Add new database user (readWrite role).
3. Go to **Network Access** -> Add IP Address: `0.0.0.0/0` (Allows Render backend IPs).
4. Go to **Database** -> Click **Connect** -> Choose **Drivers** -> Copy connection string:
   `mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/teamflow_prod?retryWrites=true&w=majority`
5. Set `MONGODB_URI` environment variable in Render.
