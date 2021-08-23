# ASTrED demo

## API installation

The API runs on FastAPI (Python) to provide an easy access point for the demo. The Python dependencies
can be installed with `pip`:

- fastapi 
- uvicorn
- astred[parsers]

### Install language models

By default, the API assumes that English, French, Dutch, and German models are installed. You can change 
the `languages` variables as you wish. The front-end will pick up this change accordingly. The language 
models need to be installed, though. So to install the default models you can run the attached bash script.

```shell
sh install-default-models.sh
```
 
To start the API server, run the following command in the `astred-demo-api/src` directory. This may take a while to 
load all the models.

```shell
uvicorn main:app --reload --port 5000
```

You can change the port, but **make sure that you verify that the end points are correct** in `astred-demo-frontend/src/constants.js`.

## Available scripts in the front-end directory

In the project directory, you can run:

### `npm install`

To install all the requied dependencies for local development.

### `npm start`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information
on how best to deploy the front-end app.
