const starBioSchema = require('../models/starBioSchema');
const createStarSchema = require('../models/newStarSchema');

async function deleteStarBioController(req, res) {
    console.log('deleteStarBioController');
    try {
        const { starname } = req.params; // Extract starname from request parameters

        // Check if the star bio exists
        const star = await createStarSchema.findById(starname);
        if (!star) {
            return res.status(404).json({ message: 'Star not found' });
        }

        // Delete the star bio from the database
        await starBioSchema.findOneAndDelete({ starname });

        // Remove the star bio reference from the corresponding star collection document
        await createStarSchema.findByIdAndUpdate(starname, { starbio: null }, { new: true });

        res.status(200).json({ message: 'Star bio deleted successfully' });
    } catch (error) {
        console.error('Error in deleteStarBioController:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
async function updateStarBioController(req, res) {
    console.log('updateStarBioController');
    try {
        const { starname } = req.params; // Extract starname from request parameters

        // Check if the star bio exists
        const star = await createStarSchema.findById(starname);
        if (!star) {
            return res.status(404).json({ message: 'Star not found' });
        }

        // Extract updated fields from request body
        const {
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

        // Update the star bio in the database
        await starBioSchema.findOneAndUpdate(
            { starname },
            {
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
                measurement: {  // Update the nested fields within measurement
                    ...star.starbio.measurement,  // Preserve existing nested fields
                    ...measurement  // Update with new values
                },
                tattoos,
                piercings,
                skills,
                pubic,
                boobs
            },
            { new: true }
        );

        res.status(200).json({ message: 'Star bio updated successfully' });
    } catch (error) {
        console.error('Error in updateStarBioController:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = updateStarBioController;


module.exports = {deleteStarBioController, updateStarBioController};