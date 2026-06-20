# features/api/members.feature
Feature: CRUD Operations - Members API

  Background:
    Given I am an API user
    And the API base URL is "http://localhost:5002"
  # TC-API-001

  @smoke @positive @EP
  Scenario: TC-API-001 - Get existing member by ID
    Given I have a member with ID 1
    When I request to get the member
    Then I should receive a 200 status code
    And the response should contain:
      | field  | value  |
      | id     |      1 |
      | name   | Monil  |
      | gender | Female |
    And the response should match the Member schema
  # TC-API-002

  @negative @BVA
  Scenario: TC-API-002 - Get non-existing member by ID
    Given I have a member with ID 9999
    When I request to get the member
    Then I should receive a 404 status code
    And the error message should contain "doesn't exist"
  # TC-API-003

  @smoke @positive @EP
  Scenario: TC-API-003 - Create member with valid data
    Given I have the following member data:
      | name      | gender |
      | Tatiana M | Female |
    When I request to create a new member
    Then I should receive a 201 status code
    And the response should contain:
      | field  | value     |
      | name   | Tatiana M |
      | gender | Female    |
    And the response should match the Member schema
    And the response should have an ID
  # TC-API-004

  @negative @EP @BVA
  Scenario: TC-API-004 - Create member with invalid data
    Given I have the following invalid member data:
      | name | gender  |
      |      | Invalid |
    When I request to create a new member
    Then I should receive a 400 status code
    And the error message should contain a validation error
  # TC-API-005

  @smoke @positive @EP
  Scenario: TC-API-005 - Update existing member
    Given I have a member with ID 1
    And I have the following update data:
      | name              | gender |
      | Monil Actualizada | Male   |
    When I request to update the member
    Then I should receive a 200 status code
    And the changes should be persisted
  # TC-API-006

  @negative @BVA
  Scenario: TC-API-006 - Update with invalid data
    Given I have a member with ID 1
    And I have the following invalid update data:
      | name | gender |
      |      |        |
    When I request to update the member
    Then I should receive a 400 status code
    And the error message should contain a validation error
  # TC-API-007

  @smoke @positive @StateTransition
  Scenario: TC-API-007 - Delete member and verify
    Given I create a new member with:
      | name     | gender |
      | TempUser | Male   |
    When I request to delete the member
    Then I should receive a 200 status code
    And the member should no longer exist
  # TC-API-008

  @files @smoke @positive @EP
  Scenario: TC-API-008 - Upload image file
    Given I have an image file "test_image.png"
    When I upload the file
    Then I should receive a 201 status code
    And the file should be uploaded successfully
  # TC-API-009

  @files @smoke @positive @EP
  Scenario: TC-API-009 - Download uploaded image
    Given I have uploaded a file
    When I download the uploaded file
    Then I should receive a 200 status code
    And the file should be downloaded successfully
