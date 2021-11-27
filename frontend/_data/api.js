

//remove the comments when you have wired up the API
require('dotenv').config();
const superagent = require('superagent');

//async function to get the posts
getData = async () => {
  console.log(`${process.env.STRAPIAPI}property-details/`)
  var res = await superagent.get(`${process.env.STRAPIAPI}property-details/`).query({});
  //console.log(res.body)
  return(res.body)
}


module.exports = async () => {
  //set an array 
  let result = []
  //call the get get Data fuction
  if (result.length === 0) result =  await getData();
  //console.log(properties[0].id)

  return {
    dataArray: result
  }

}