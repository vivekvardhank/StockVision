# StockVision

StockVision is a pantry tracker application that helps you keep track of your pantry items and their stock levels. The application allows you to add, update, and remove items from your inventory. You can also use your camera to add items by detecting them using OpenAI's GPT-4 and Google Vision API. Additionally, StockVision provides a feature to get recipes based on the items available in your pantry using OpenAI's GPT-3.5-turbo model.

## Live Preview

You can access the live preview of the application [here](https://stock-vision.vercel.app/).

## Features

- **Inventory Management**: Add, update, remove and search pantry items.
- **Camera Integration**: Add items using your camera with the help of OpenAI and Google Vision APIs for image detection.
- **Recipe Suggestions**: Get recipes based on the items available in your pantry using OpenAI's GPT-3.5-turbo model.
-  **Search Functionality**: Search for items in your inventory.


## Technologies Used

- **Frontend**: Next.js, Material-UI
- **Backend**: Node.js, Firebase Firestore
- **APIs**: OpenAI API, Google Vision API

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine
- Firebase account and project setup
- OpenAI API key
- Google Cloud Vision API key

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/vivekvardhank/StockVision.git
    cd StockVision
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory with the following content:

    ```env
    NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
    NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
    NEXT_PUBLIC_GOOGLE_APPLICATION_CREDENTIALS=your_encrypted_google_vision_credentials
    NEXT_PUBLIC_ENCRYPTION_KEY=your_encryption_key
    NEXT_PUBLIC_IV=your_initialization_vector
    ```

4. Start the development server:

    ```bash
    npm run dev
    ```

5. Open your browser and navigate to `http://localhost:3000` to see the application in action.

## Usage

### Inventory Management

- **Add Item**: Click on the "Add Item" button, fill in the item name and count, and click "Add". You can also use your camera to detect the item.
- **Update Item**: Click on the edit icon next to the item, update the name and/or count, and click "Save".
- **Remove Item**: Click on the delete icon next to the item to remove it from the inventory.
- **Search Item**: Search for items in your inventory.


### Camera Integration

- Click on the camera icon to open the camera interface.
- Capture an image of the item you want to add.
- The application will detect the item and populate the item name automatically.

### Recipe Suggestions

- Click on the "Get Recipes" button to get recipes based on the items available in your pantry.
- The recipes will be displayed along with the ingredients and step-by-step instructions.

## Further Improvements

Here are some areas for future development and improvement:

- **Authentication**: Implement user authentication to allow multiple users to manage their own pantry items securely.
- **Modularity**: Refactor the code to improve modularity and maintainability, as this is the first Next.js application and may lack modular design.
- **User Profiles**: Allow users to create profiles to save their inventory and preferences.
- **Shopping List**: Add a feature to generate a shopping list based on low-stock items.
- **Expiration Dates**: Enable tracking of expiration dates for items and send notifications for items that are about to expire.
- **Data Visualization**: Include data visualization tools to provide insights into pantry usage trends.
- **Multi-language Support**: Add support for multiple languages to make the application accessible to a wider audience.
- **Offline Support**: Implement offline support so that users can manage their pantry even without an internet connection.


## Code Overview

### Frontend

- The frontend is built using Next.js and Material-UI for the UI components.
- `pages/index.js`: The main page where inventory management and camera integration are implemented.
- `components/search.js`: A search component to filter the inventory.

### Backend

- The backend is integrated with Firebase Firestore for data storage.
- `api/recipes.js`: API endpoint to get recipes using OpenAI GPT-3.5-turbo model.
- `api/vision.js`: API endpoint to detect items using OpenAI and Google Vision APIs.

### Environment Variables

- `NEXT_PUBLIC_OPENAI_API_KEY`: Your OpenAI API key.
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Your Firebase API key.
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain.
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Your Firebase project ID.
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket.
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID.
- `NEXT_PUBLIC_FIREBASE_APP_ID`: Your Firebase app ID.
- `NEXT_PUBLIC_GOOGLE_APPLICATION_CREDENTIALS`: Your encrypted Google Vision credentials.
- `NEXT_PUBLIC_ENCRYPTION_KEY`: Your encryption key for Google Vision credentials.
- `NEXT_PUBLIC_IV`: Your initialization vector for encryption.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request if you have any improvements or bug fixes.
