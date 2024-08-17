const starBioSchema = require('../models/starBioSchema');
const createStarSchema = require('../models/newStarSchema');

async function updateBioController(req, res) {
    try {
        const { starBioId } = req.params;
        const {
            starname,
            aliases,
            birthname,
            birthplace,
            birthdate,
            deathdate,
            occupation,
            status,
            start,
            end,
            ethnicity,
            height,
            hair,
            eyes,
            shoesize,
            measurement,
            tattoos,
            piercings,
            skills,
            pubic,
            boobs
        } = req.body;

        if (!starBioId) {
            return res.status(400).json({ message: 'Star Bio ID is required' });
        }

        // Find the star bio by ID
        const starBio = await starBioSchema.findById(starBioId);
        if (!starBio) {
            return res.status(404).json({ message: 'Star Bio not found' });
        }

        // Update the fields if they are provided in the request body
        if (starname) {
            const star = await createStarSchema.findById(starname);
            if (!star) {
                return res.status(400).json({ message: 'Invalid starname ID' });
            }
            starBio.starname = starname;
        }
        if (aliases) starBio.aliases = aliases;
        if (birthname) starBio.birthname = birthname;
        if (birthplace) starBio.birthplace = birthplace;
        if (birthdate) starBio.birthdate = birthdate;
        if (deathdate) starBio.deathdate = deathdate;
        if (occupation) starBio.occupation = occupation;
        if (status) starBio.status = status;
        if (start) starBio.start = start;
        if (end) starBio.end = end;
        if (ethnicity) starBio.ethnicity = ethnicity;
        if (height) starBio.height = height;
        if (hair) starBio.hair = hair;
        if (eyes) starBio.eyes = eyes;
        if (shoesize) starBio.shoesize = shoesize;
        if (measurement) starBio.measurement = measurement;
        if (tattoos) starBio.tattoos = tattoos;
        if (piercings) starBio.piercings = piercings;
        if (skills) starBio.skills = skills;
        if (pubic) starBio.pubic = pubic;
        if (boobs) starBio.boobs = boobs;

        // Save the updated star bio object to the database
        const updatedStarBio = await starBio.save();

        res.status(200).json(updatedStarBio); // Respond with the updated star bio object
    } catch (error) {
        console.error('Error in updateBioController:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = updateBioController;
