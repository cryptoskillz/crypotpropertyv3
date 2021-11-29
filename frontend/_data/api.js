
/*

TODO

rental agreements when we do more than 1.


*/
//remove the comments when you have wired up the API
require('dotenv').config();
const superagent = require('superagent');

//async function to get the posts
getData = async () => {
  console.log(`${process.env.STRAPIAPI}property-details/`)
  var res = await superagent.get(`${process.env.STRAPIAPI}property-details/`).query({});
  //console.log(res.body)



  //property owners
  console.log(`${process.env.STRAPIAPI}property-contracts/${res.body[0].rental_agreement.id}/`)
  var res2 = await superagent.get(`${process.env.STRAPIAPI}property-contracts/${res.body[0].rental_agreement.id}/`).query({});
  //console.log(res2.body)
  res.body[0]._proptery_owners = res2.body.proptery_owners
  //console.log(res.body)


  //rental aggrement
  console.log(`${process.env.STRAPIAPI}rental-agreements/${res.body[0].rental_agreement.id}/`)
  var res3 = await superagent.get(`${process.env.STRAPIAPI}rental-agreements/${res.body[0].rental_agreement.id}/`).query({});
  //console.log(res3.body)
  res.body[0]._rental_agreements = res3.body
  //console.log(res.body[0]._rental_agreements)


  //owner payments
  console.log(`${process.env.STRAPIAPI}property-owner-payments/?rental_agreement=${res.body[0].rental_agreement.id}`)
  var res4 = await superagent.get(`${process.env.STRAPIAPI}property-owner-payments/?rental_agreement=${res.body[0].rental_agreement.id}`).query({});
  //console.log(res4.body)
  res.body[0]._owner_payments = res4.body
  //console.log(res.body[0]._owner_payments)

  //console.dir(res.body[0].images)

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