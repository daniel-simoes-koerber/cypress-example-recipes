/// <reference types="cypress" />
let authenticatedUser = ''

before(function fetchUser () {
  cy.request('POST', 'http://localhost:4000/users/authenticate', {
    username: Cypress.env('username'),
    password: Cypress.env('password'),
  })
  .its('body')
  .then((res) => {
    authenticatedUser = res
  })
})

// but set the user before visiting the page
// so the app thinks it is already authenticated
beforeEach(function setUser () {
  cy.visit('/', {
    onBeforeLoad (win) {
      // and before the page finishes loading
      // set the user object in local storage
      win.localStorage.setItem('user', JSON.stringify(authenticatedUser))
    },
  })
  // the page should be opened and the user should be logged in
})

describe('logs in', () => {
  const usersEndpoint = 'http://localhost:4000/users'
  const authenticationEndpoint = `${usersEndpoint}/authenticate`

  it('using UI', () => {
    cy.visit('/')
    cy.location('pathname').should('equal', '/login')

    // enter valid username and password with values coming from cypress.json
    cy.get('[name=username]').type(Cypress.env('username'))
    cy.get('[name=password]').type(Cypress.env('password'))
    cy.contains('button', 'Login').click()

    // confirm we have logged in successfully
    cy.location('pathname').should('equal', '/')
    cy.contains('Hi Test!')
    .should('be.visible')
    .then(() => {
    /* global window */
      const userString = window.localStorage.getItem('user')

      expect(userString).to.be.a('string')
      const user = JSON.parse(userString)

      expect(user).to.be.an('object')
      expect(user).to.have.keys([
        'id',
        'username',
        'firstName',
        'lastName',
        'token',
      ])

      expect(user.token).to.be.a('string')
    })

    // now we can log out
    cy.contains('a', 'Logout').click()
    cy.location('pathname').should('equal', '/login')
  })

  it('fails to access protected resource', () => {
    cy.request({
      url: usersEndpoint,
      failOnStatusCode: false,
    })
    .its('status')
    .should('equal', 401)
  })

  // We already know that the login works as expected, we no longer need to test it
  // through the UI as this has many disadvantages
  it('Does not log in with invalid password', () => {
    cy.visit('/')
    cy.location('pathname').should('equal', '/login')

    // try logging in with invalid password
    cy.get('[name=username]').type('username')
    cy.get('[name=password]').type('wrong-password')
    cy.contains('button', 'Login').click()

    // still on /login page plus an error is displayed
    cy.location('pathname').should('equal', '/login')
    cy.contains('.alert-danger', 'Username or password is incorrect').should(
      'be.visible'
    )
  })

  it('should fail with invalid credentials', () => {
    cy.request({
      method: 'POST',
      url: authenticationEndpoint,
      //dont want the test failing on a bad status code for negative scenarios
      failOnStatusCode: false,
      body: {
        username: 'test',
        password: 'bad',
      },
    })
    .then((response) => {
      expect(response.status).to.equal(400)
      expect(response.body.message).to.equal('Username or password is incorrect')
    })
  })

  it('shows logged in user', () => {
    // this user information came from authenticated XHR call
    cy.contains('li', 'Test User').should('be.visible')
  })
})
