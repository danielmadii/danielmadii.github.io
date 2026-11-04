## Overview

PetFindr helps reunite lost pets with their owners. People who find a pet can report it with a photo and location; owners can search an interactive map where each report appears as a paw marker with the pet's photo and contact details. The app also lets people post pets for adoption.

## Architecture

A Node.js and Express server serves the static front end and exposes a JSON API. Data lives in MySQL, reached through a `mysql2` connection pool. Pet photos are uploaded with Multer. The map runs on Leaflet, with Geoapify providing geolocation. Form submissions are protected by hCaptcha, verified server-side against hCaptcha's `siteverify` endpoint before the server accepts them.

## Implementation

- **API routes** for account login, user info and password changes; pet and lost-pet submission; photo uploads; pet and owner details; and the marker data that feeds the map.
- **Front end** in HTML, CSS and vanilla JavaScript, with pages for reporting a found pet, searching for a lost one, pet details, about, contact, privacy policy, terms of service and a 404 page.
- **Configuration** through environment variables with `dotenv`, keeping database and captcha secrets out of the code.

## Links

- Source: [github.com/danielmadii/PetFindr-Finding-Lost-Pets-Webapp](https://github.com/danielmadii/PetFindr-Finding-Lost-Pets-Webapp)
