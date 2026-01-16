// const data = 2;
// module.exports = {
//   content : data,
//   title : "貓貓"
// }

function errorHandle(err, req, res){
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json'
  }
  res.writeHead(400, headers);
  res.write(JSON.stringify({
    status: "false",
    message: err.message
  }));
  res.end();
}

module.exports = errorHandle;
