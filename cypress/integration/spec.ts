/* eslint-disable no-unused-expressions */
/// <reference types="cypress" />

beforeEach(() => {
  cy.visit('/')
})

it('displays main div', () => {
  cy.get('#main').should('exist')
})

it('displays Hello World', () => {
  cy.get('#main').should('contain.text', 'Hello World!')
})
