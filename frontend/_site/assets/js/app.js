//put your generic js functon here
let whenDocumentReady = (f) => {
    /in/.test(document.readyState) ? setTimeout('whenDocumentReady(' + f + ')', 9) : f()
}
whenDocumentReady(isReady = () => {
    $('#rentaltable').DataTable();
    $('#paidintable').DataTable();
    $('#ownerstable').DataTable();
    $('#paidouttable').DataTable();
    $('#disttable').DataTable();
})