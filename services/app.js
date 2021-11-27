const superagent = require('superagent');

let apiUrl = "https://cryptoporperty.herokuapp.com/"


let getProperties = () => {

  /*  

  todo

  add total for costs and rent
  make it work with more than property
  


  */


  //get the properties.
  var res = superagent.get(apiUrl+ "property-details/").query({}).end(function(err, res) {
    //check we got a response.
    if (res.ok) {
      let result =res.body[0];

      //console.dir(result.Property_local_cost)
      //console.dir(res.body[0].rental_agreement)

      //set an ouputut array
      let output = {};
      //get the ids
      //store the property details.
      let propertyId = result.id;
      //note this wil become an array in the of ids in the future.

      let rentalAgrementId = result.rental_agreement.id;
      let propertyTokenId  = result.property_token.id;
      //debug
      //console.log("property id:"+propertyId)
      //console.log("rental agrement id:"+rentalAgrementId)
      //console.log("property token id:"+propertyTokenId)
      //console.log(res.body)
      ////get the property details and put them in the output details
      output.propertyName = result.Name
      output.propertyCost = result.Property_local_cost
      output.propertyTaxes = result.Property_taxes
      output.properylocalcurrency = result.property_local_currency.currency_type;
      output.currentlyRented = result.currently_rented;
      

      //get the rental agrement for the the property.
      /*
        Note we will have to extend this when we have multipile agrements and have a way to record the distrubations for this moment
        we are just going to use one the one agrement for simplicity stakes.
      */

      //get the property token ownership
      var res2 = superagent.get(apiUrl+ "property-contracts/"+propertyTokenId).query({}).end(function(err, propertyContractResult) {
        if (propertyContractResult.ok) {
          //loop it.
          let pTmp = [];
          if (propertyContractResult.body.proptery_owners.length > 0) {
            for (var i = 0; i < propertyContractResult.body.proptery_owners.length; ++i) {
              let per = propertyContractResult.body.proptery_owners[i].token_amount / output.propertyCost *100
              pTmp.push({name:propertyContractResult.body.proptery_owners[i].name,email:propertyContractResult.body.proptery_owners[i].email,tokens:propertyContractResult.body.proptery_owners[i].token_amount,share:per})
            }
          }
          //console.log(pTmp)
          //store it.
          output.propertyOwners =  JSON.stringify(pTmp);

          //get the rental agrements
          var res3 = superagent.get(apiUrl+ "rental-agreements/"+rentalAgrementId).query({}).end(function(err, rentalAgreementResult) {
            if (rentalAgreementResult.ok) {
              //store the rental agreement
              output.rentalAgreement = {
                id:rentalAgreementResult.body.id,
                name:rentalAgreementResult.body.name,
                amount:rentalAgreementResult.body.rental_amount,
                deposit:rentalAgreementResult.body.deposit,
                start_date:rentalAgreementResult.body.start_date,
                end_date:rentalAgreementResult.body.end_date,
                active:"yes"
              }
              //console.log(output.rentalAgreement)
              //rental payments
              
              let rTmp = [];
              let totalRentalPaidIn =0 ;

              if (rentalAgreementResult.body.rental_payments.length > 0) {
                for (var i = 0; i < rentalAgreementResult.body.rental_payments.length; ++i) {
                  let currency = rentalAgreementResult.body.rental_payments[i].currency;
                  let currencyOutput = ""
                  switch (currency) {
                    case 1:
                      currencyOutput="$"
                      break;
                    case 2:
                      currencyOutput="£"
                      break;
                    case 3:
                      currencyOutput="฿"
                      break;
                    default:
                      currencyOutput="£"
                  }
                  totalRentalPaidIn = totalRentalPaidIn+rentalAgreementResult.body.rental_payments[i].amount;
                  rTmp.push({type:"rent payment",description:"rent",amount:rentalAgreementResult.body.rental_payments[i].amount,date:rentalAgreementResult.body.rental_payments[i].payment_date,currency:currencyOutput})
                  //console.log(rentalAgreementResult.body.rental_payments[i])
                }
              }
              
              output.rentalPaidIn = JSON.stringify(rTmp)
              output.totalRentalPaidIn = totalRentalPaidIn;


              //paid out rental_costs
              //console.log(rentalAgreementResult.body.rental_costs)
              let oTmp = [];
              let totalRentalPaidOut=0
              if (rentalAgreementResult.body.rental_costs.length > 0) {
                for (var i = 0; i < rentalAgreementResult.body.rental_costs.length; ++i) {
                  let currency = rentalAgreementResult.body.rental_costs[i].currency;
                  let currencyOutput = ""
                  switch (currency) {
                    case 1:
                      currencyOutput="$"
                      break;
                    case 2:
                      currencyOutput="£"
                      break;
                    case 3:
                      currencyOutput="฿"
                      break;
                    default:
                      currencyOutput="£"
                  }
                  totalRentalPaidOut = totalRentalPaidOut + rentalAgreementResult.body.rental_costs[i].amount
                  oTmp.push({type:"cost",description:rentalAgreementResult.body.rental_costs[i].description, amount:rentalAgreementResult.body.rental_costs[i].amount,date:rentalAgreementResult.body.rental_costs[i].date,currency:currencyOutput})
                  
                }
              }

              output.rentalPaidOut = JSON.stringify(oTmp)
              output.rentalPaidOut = totalRentalPaidOut;

              var res4 = superagent.get(apiUrl+ "property-owner-payments/?rental_agreement="+rentalAgrementId).query({}).end(function(err, ownerPaymentsResult) {
                if (ownerPaymentsResult.ok) {
                  //process it. 
                  //console.log("Owner Payments ")
                  //console.log(ownerPaymentsResult)
                  //output.payments = ownerPaymentsResult.body
                  let opTmp = [];
                  let totalOwnersPaidOut=0;
                  if (ownerPaymentsResult.body.length > 0) {
                    for (var i = 0; i < ownerPaymentsResult.body.length; ++i) {
                      //console.log(ownerPaymentsResult.body[i])
                      
                      let currency = ownerPaymentsResult.body[i].currency;
                      let currencyOutput = ""
                      switch (currency) {
                        case 1:
                          currencyOutput="$"
                          break;
                        case 2:
                          currencyOutput="£"
                          break;
                        case 3:
                          currencyOutput="฿"
                          break;
                        default:
                          currencyOutput="£"
                      }
                      totalOwnersPaidOut = totalOwnersPaidOut+ownerPaymentsResult.body[i].amount
                      opTmp.push({paidto:ownerPaymentsResult.body[i].proptery_owner.name,description:ownerPaymentsResult.body[i].name,amount:ownerPaymentsResult.body[i].amount,date:ownerPaymentsResult.body[i].datepaid,currency:currencyOutput})
                      //console.log(rentalAgreementResult.body.rental_payments[i])
                    }
                  }
                  output.ownersPaidOut = JSON.stringify(opTmp)
                  output.totalOwnersPaidOut = totalOwnersPaidOut;
                  let totalLeft = output.totalRentalPaidIn-( output.totalOwnersPaidOut+ output.rentalPaidOut ) ;
                  output.balance = totalLeft;
                  //console.dir(output, { depth: null }); // `depth: null` ensures unlimited recursion
                  //optionally, you can use the callback
                  let csv = "";
                  csv = csv+"name,"+ output.propertyName+" \n"
                  csv = csv+"cost,"+ output.propertyCost+"  \n"
                  csv = csv+"taxes,"+  output.propertyTaxes +"  \n"
                  csv = csv+"currency,"+ output.properylocalcurrency+"  \n"
                  csv = csv+"currently rented,"+ output.currentlyRented+"  \n"

                  csv = csv+"\n";
                  csv = csv+"\n";
                  csv = csv+"Rental Agreements\n";
                  csv = csv+"id,name,amount,deposit,start date,end date,active\n"
                  csv = csv+output.rentalAgreement.id+","+output.rentalAgreement.name+","+output.rentalAgreement.amount+","+output.rentalAgreement.deposit+","+output.rentalAgreement.start_date+","+output.rentalAgreement.end_date+","+output.rentalAgreement.active+"\n";
                  csv = csv+"\n";
                  csv = csv+"\n";
                  csv = csv+"Owners\n"; 
                  //console.log(output.propertyOwners)
                  csv = csv+"name,email,tokens,share %\n"
                  for (var i = 0; i < pTmp.length; ++i) {
                    //console.log(pTmp[i].name+","+pTmp[i].email+","+pTmp[i].tokens+","+pTmp[i].share+"\n" )
                    csv = csv+pTmp[i].name+","+pTmp[i].email+","+pTmp[i].tokens+","+pTmp[i].share+"\n"  
                  }   

                  csv = csv+"\n";
                  csv = csv+"\n";
                  csv = csv+"Paid In\n"; 
                  csv = csv+"payment type,description,amount,date,currency\n"
                  for (var i = 0; i < rTmp.length; ++i) {
                    //console.log(pTmp[i].name+","+pTmp[i].email+","+pTmp[i].tokens+","+pTmp[i].share+"\n" )
                    csv = csv+rTmp[i].type+","+rTmp[i].description+","+rTmp[i].amount+","+rTmp[i].date+","+rTmp[i].currency+"\n"  
                  }  

                             
                  csv = csv+"\n";
                  csv = csv+"\n";
                  csv = csv+"Paid Out\n"; 
                  csv = csv+"payment type,description,amount,date,currency\n"
                  for (var i = 0; i < oTmp.length; ++i) {
                    //console.log(pTmp[i].name+","+pTmp[i].email+","+pTmp[i].tokens+","+pTmp[i].share+"\n" )
                    csv = csv+oTmp[i].type+","+oTmp[i].description+","+oTmp[i].amount+","+oTmp[i].date+","+oTmp[i].currency+"\n"  
                  }                           

                  csv = csv+"\n";
                  csv = csv+"\n";
                  csv = csv+"Distributions\n"; 
                  csv = csv+"payment to,description,amount,date,currency\n"
                  for (var i = 0; i < opTmp.length; ++i) {
                    console.log(opTmp)
                    csv = csv+opTmp[i].paidto+","+opTmp[i].description+","+opTmp[i].amount+","+opTmp[i].date+","+opTmp[i].currency+"\n"  
                  }   

                  csv = csv+"\n";
                  csv = csv+"\n";
                  
                  //csv = csv+"Balance,"+output.balance+"\n"; 
                  //csv = csv+"Paid,"+output.balance+"\n"; 
                  csv = csv+"Balance,"+output.balance+"\n"; 

                  //console.log(oTmp)
                  fs = require('fs');
                  fs.writeFile('output.csv', csv, function (err) {
                    if (err) return RonsoleAlog(err);
                    //console.log('Hello World > helloworld.txt');
                  });

                } else {
                  console.log(err);
                }
              })
            } else {
              console.log(err);
            }
          })
        } else {
          console.log(err);
        }
      })

      
    } else {
      console.log(err);
    }
  })
}

//call the function 
getProperties();
