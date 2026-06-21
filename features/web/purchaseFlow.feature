# features/web/purchaseFlow.feature
Feature: Flujo de Compra - Automation Exercise

  Background:
    Given I am a customer on the Automation Exercise website
    And I navigate to the homepage

  @smoke @web @positive
  Scenario: TC-WEB-001 - Seleccionar categoría y agregar 5 productos al carrito
    When I select a category and subcategory
    And I select 5 random products
    And I assign random quantities between 1 and 10 units to each product
    And I add all products to the cart
    When I navigate to the cart page
    Then I should see all 5 products in the cart
    And the product names in the cart should match the selected products
    And the quantities in the cart should match the assigned quantities
    And the total price should match the sum of all products
    And the total number of items should match the sum of quantities

  @web @regression
  Scenario: TC-WEB-002 - Verificar carrito vacío al inicio
    Given I am a customer on the Automation Exercise website
    When I navigate directly to the cart page
    Then the cart should be empty

  @web @regression
  Scenario: TC-WEB-003 - Seleccionar Women → Dress
    Given I am a customer on the Automation Exercise website
    When I select "Women" category and "Dress" subcategory
    And I select 5 random products
    And I add all products to the cart
    When I navigate to the cart page
    Then I should see all products in the cart
    And the total price should match the sum of all products
