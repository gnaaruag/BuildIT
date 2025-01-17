const Participate = require("../models/participation.model.js");
const Participation = Participate.Participation;
const time = require("./time.js");

const Contest = require("../models/contest.model.js");

const SEEPracticalEvaluation = async (contestId) => {
    try {
        let contest = await Contest.findOne({contestId: contestId })
        let participations = await Participation.find({ contestId: contestId })
        let contestEndTime = time.parseDateTime(contest.contestDate, contest.contestEndTime);
        let now = time.now();
        if (!contest.evaluation && contestId.startsWith("SEE") && now >= contestEndTime){
            for ( let participation of participations ){
                let submissions = participation.submissionResults;
            
                submissions.sort((a, b) => {
                    return b.score - a.score;
                });
    
                const scoring = {100: 10, 50: 7, 25: 5};
                if (submissions.length >= 3){
                    submissions[0].score = scoring[submissions[0].score];
                    submissions[1].score = scoring[submissions[1].score];
    
                    submissions[2].score = scoring[submissions[2].score];
                    for (let i = 3; i < submissions.length; i++){
                        submissions[i].score = 0;
                    }
                }
                else if (submissions.length == 2){
                    submissions[0].score = scoring[submissions[0].score];
                    submissions[1].score = scoring[submissions[1].score];
                }
                else if (submissions.length == 1){
                    submissions[0].score = scoring[submissions[0].score];
                }
    
                let UpdatedParticipation = new Participation(participation);
                await UpdatedParticipation.save();
            }    
            participations = await Participation.find({ contestId: contestId });
            await Contest.updateOne({ contestId: contestId }, { evaluation: true });
            return participations;
        }
        return participations;
        
    }
    catch(err){
        console.log("ERROR", err)
    }
}


module.exports = {
    SEEPracticalEvaluation
}