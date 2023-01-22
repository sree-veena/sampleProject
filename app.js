const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const dbPath = path.join(__dirname, "moviesData.db");
const app = express();
app.use(express.json());

let db = null;

// Initialization
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DBError: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// Convert DB Object to Response Object
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

// Get All Players API
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    ORDER BY
      movie_id;`;

  const movieArray = await db.all(getMoviesQuery);

  let resultArray = [];
  for (let movie of movieArray) {
    let result = convertDbObjectToResponseObject(movie);
    resultArray.push(result);
  }

  response.send(resultArray);
});

// Add New Player API
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;

  const { directorId, movieName, leadActor } = movieDetails;

  const addMovieQuery = `
    INSERT INTO
      movie (director_id, movie_name, lead_actor)
    VALUES
      ('${directorId}', '${movieName}', '${leadActor}');`;

  const dbResponse = await db.run(addMovieQuery);

  response.send("Movie Successfully Added");
});

// // Get Player by player_id API
app.get("/movies/:movieId/", async (request, response) => {
  try {
    const { movieId } = request.params;

    const getMovieQuery = `
    SELECT
      *
    FROM
      movie
    WHERE
      movie_id = ${movieId};`;

    const movie = await db.get(getMovieQuery);

    const result = convertDbObjectToResponseObject(movie);
    // console.log(result);

    response.send(result);
  } catch (e) {
    console.log(`${e.message}`);
  }
});

// // Update Player Details API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const movieDetails = request.body;

  const { directorId, movieName, leadActor } = movieDetails;

  const updateMovieQuery = `
    UPDATE
      movie
    SET
      director_id= '${directorId}',
      movie_name = '${movieName}',
      lead_actor = '${leadActor}'
    WHERE
      movie_id = ${movieId};`;

  await db.run(updateMovieQuery);

  response.send("Movie Details Updated");
});

// // Delete Player by player_id API
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const deleteMovieQuery = `
    DELETE FROM
      movie
    WHERE
      movie_id = ${movieId};`;

  await db.run(deleteMovieQuery);

  response.send("Movie Removed");
});

const convertDbObjectToResponseObject2 = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
    SELECT
      *
    FROM
      director
    ORDER BY
      director_id;`;

  const directorArray = await db.all(getDirectorQuery);

  let resultArray = [];
  for (let director of directorArray) {
    let result = convertDbObjectToResponseObject2(director);
    resultArray.push(result);
  }

  response.send(resultArray);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const getDirectorQuery = `
    SELECT
       movie_name
    FROM
      movie
    WHERE
      director_id = ${directorId};`;

  const directorArray = await db.all(getDirectorQuery);

  let resultArray = [];
  for (let director of directorArray) {
    let result = convertDbObjectToResponseObject(director);
    resultArray.push(result);
  }

  response.send(resultArray);
});

module.exports = app;
