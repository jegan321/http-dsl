;(async function () {
  let request, response

  print(`should search for a facility item`)
  response = await sendRequest('GET', 'http://localhost:8080/scm', {
    Authorization: 'Basic ' + base64('trivalence_admin:admin'),
    'X-Facility-ID': 1
  })
  let facilityItemId = response.body.results[0].facilityItemId
  print(`facilityItemId=${facilityItemId}`)
  print()
})()

function print(value) {
  console.log(value)
}

async function sendRequest(url, method, headers, body) {
  const response = await fetch(url, {
    method: method,
    headers: headers,
    body: body
  })
  const body = await response.text()
  return {
    status: response.status,
    headers: response.headers,
    body
  }
}

function base64(input) {
  return Buffer.from(input).toString('base64')
}
