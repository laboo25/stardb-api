const starBioSchema = require('../models/starBioSchema');
const createStarSchema = require('../models/newStarSchema');

async function createStarBioController(req, res) {
    try {
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

        if (!starname || !birthdate) {
            return res.status(400).json({ message: 'starname and birthdate are required' });
        }

        // Check if a star bio with the same starname and birthdate already exists
        const existingStarBio = await starBioSchema.findOne({ starname, birthdate });
        if (existingStarBio) {
            return res.status(400).json({ message: 'A star bio with the same starname and birthdate already exists' });
        }

        // Validate starname
        const star = await createStarSchema.findById(starname);
        if (!star) {
            return res.status(400).json({ message: 'Invalid starname ID' });
        }

        // Create new star bio object
        const newStarBio = new starBioSchema({
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
        });

        // Save the new star bio object to the database
        const savedStarBio = await newStarBio.save();

        // Update the star object to include the starbio reference
        await createStarSchema.findByIdAndUpdate(starname, { starbio: savedStarBio._id }, { new: true });

        res.status(201).json(savedStarBio); // Respond with the saved star bio object
    } catch (error) {
        console.error('Error in createStarBioController:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = createStarBioController;
