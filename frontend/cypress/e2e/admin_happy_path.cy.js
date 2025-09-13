// Basic happy path: admin logs in, sees dashboard, filters invoices, adds cash register (UI level)

describe('Admin happy path', () => {
  it('logs in and loads dashboard', () => {
    cy.visit('/auth/login');
    cy.get('input[type="email"], input[name="email"], input#email').type('admin@example.com');
    cy.get('input[type="password"], input[name="password"], input#password').type('password123');
    cy.contains('button, [role="button"]', /log in|sign in/i).click();

    // Should land on dashboard/home
    cy.url().should('match', /dashboard|home|admin/i);
    cy.contains(/dashboard|welcome|admin/i, { matchCase: false });
  });

  it('navigates to Billing > Invoices and filters', () => {
    cy.visit('/');
    cy.contains(/invoices/i).click({ force: true });
    cy.get('input[placeholder*="filter" i], input[placeholder*="search" i]').type('INV');
    cy.wait(500);
    cy.contains(/invoice|inv-/i);
  });

  it('adds a cash register via admin UI', () => {
    cy.visit('/admin/billing/cash-registers');
    cy.contains(/add|new/i).click({ force: true });
    cy.get('input[name="name"], input#name').type('Front Desk');
    cy.get('select[name="location"], select#location').select(0, { force: true });
    cy.contains('button, [type="submit"]', /save|create/i).click();
    cy.contains(/created|saved|success/i);
  });
});


