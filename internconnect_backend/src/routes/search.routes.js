const express = require("express");
const router = express.Router();
const {
  searchListings,
  getSuggestions,
} = require("../controllers/search.controller");

router.post("/listings", searchListings);
router.get("/suggestions", getSuggestions);

module.exports = router;
