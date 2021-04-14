/// <reference types="cypress" />

describe('Logging In - HTML Web Form - Inneficiently', function () {
  // we can use these values to log in
  const username = 'jane.lane'
  const password = 'password123'

  context('through UI', function () {
    beforeEach(() => {
      cy.visit('/login')
      cy.get('input[name=username]').type(username)
      cy.get('input[name=password]').type(`${password}{enter}`)
    })

    // an e2e test validating the correct app behavior
    it('should login with valid credentials', function () {
      cy.url().should('include', '/dashboard')
      cy.get('h1').should('contain', 'jane.lane')
      // and our cookie should be set to 'cypress-session-cookie'
      cy.getCookie('cypress-session-cookie').should('exist')
    })

    it('should access /users', function () {
      cy.visit('/users')
      cy.get('h1').should('contain.text', 'Users')
    })

    it('should access /dashboard', () => {
      cy.visit('/dashboard')
      cy.get('h1').should('contain.text', 'Dashboard')
    })

    it('should access /admin', () => {
      cy.visit('/admin')
      cy.get('h1').should('contain.text', 'Admin')
    })
  })

  context('negative tests', () => {
    it('needs login to access /dashboard', function () {
      cy.visit('/dashboard')
      cy.get('h3').should('contain.text', 'You are not logged in and cannot access this page')
    })
  })
})
