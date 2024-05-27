import Mocha from 'mocha'
import assert from 'assert'

export function testCaseExample() {
  const mocha = new Mocha()

  const testSuite = Mocha.Suite.create(mocha.suite, 'Test Suite')

  testSuite.addTest(
    new Mocha.Test('Test Case', function () {
      assert.strictEqual(1, 1, 'This will fail')
    })
  )

  mocha.run(function (failures) {
    process.exitCode = failures ? 1 : 0
  })
}
