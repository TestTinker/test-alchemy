import { test, expect } from '@mobilewright/test';
import type { Locator, Screen } from '@mobilewright/core';
import type { TestInfo } from '@playwright/test';

const CONTACTS_APP_ID = 'com.android.contacts';
const ALT_CONTACTS_APP_ID = 'com.google.android.contacts';

/**
 * Generates a random contact name
 */
function generateRandomName(): string {
    const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eva', 'Frank', 'Grace', 'Henry', 'Iris', 'Jack'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${firstName} ${lastName}`;
}

/**
 * Generates a unique phone number
 */
function generateUniquePhoneNumber(): string {
    const timestamp = Date.now().toString().slice(-10);
    return `+1${timestamp}`;
}

/**
 * Attaches a screenshot to test info for debugging
 */
async function attachStepScreenshot(screen: Screen, testInfo: TestInfo, name: string): Promise<void> {
    if (process.env.MOBILE_DEBUG_SCREENSHOTS !== '1') {
        return;
    }

    await testInfo.attach(name, {
        body: await screen.screenshot(),
        contentType: 'image/png',
    });
}

/**
 * Returns the first visible locator from a list
 */
async function firstVisible(locators: Locator[], timeout = 2_000): Promise<Locator> {
    for (const locator of locators) {
        if (await locator.isVisible({ timeout }).catch(() => false)) {
            return locator;
        }
    }

    throw new Error('None of the expected mobile locators were visible.');
}

test('QARDEX-3: Add a contact with random name and unique number', async ({ device, screen }, testInfo) => {
    test.setTimeout(120_000);

    const contactName = generateRandomName();
    const phoneNumber = generateUniquePhoneNumber();
    const phoneDigits = phoneNumber.replace(/^\+1/, '');

    // Try to terminate existing Contacts app instance
    await device.terminateApp(CONTACTS_APP_ID).catch(() => { });
    await device.terminateApp(ALT_CONTACTS_APP_ID).catch(() => { });

    await test.step('Open Contacts app', async () => {
        await device.launchApp(ALT_CONTACTS_APP_ID).catch(async () => {
            await device.launchApp(CONTACTS_APP_ID);
        });

        await expect(
            await firstVisible([
                screen.getByLabel('Create contact'),
                screen.getByText('Contacts'),
                screen.getByText('Search contacts'),
            ], 10_000)
        ).toBeVisible();
        await attachStepScreenshot(screen, testInfo, '01-contacts-opened');
    });

    await test.step('Open add contact dialog', async () => {
        // Find and tap the create contact button (FAB or menu button)
        let createButton = await firstVisible([
            screen.getByLabel('Create contact'),
            screen.getByLabel('New contact'),
            screen.getByLabel('Add contact'),
            screen.getByRole('button', { name: /create|new|add/i }),
        ], 5_000).catch(() => null);

        if (!createButton) {
            throw new Error('Could not find create contact button');
        }

        await createButton.tap();

        // Wait for the create contact form to appear
        await expect(screen.getByLabel('First name')).toBeVisible({ timeout: 10_000 });
        await attachStepScreenshot(screen, testInfo, '02-add-contact-dialog');
    });

    await test.step(`Fill in contact name: ${contactName}`, async () => {
        // Use the first name and last name fields from the window dump
        const firstNameField = screen.getByLabel('First name');
        const lastNameField = screen.getByLabel('Last name');

        // Split the contact name into first and last name
        const [firstName, lastName] = contactName.split(' ');

        // First name field interactions
        await firstNameField.tap();
        await firstNameField.fill(' ');
        await device.driver.pressButton('BACK'); // Dismiss any autofill suggestions
        await firstNameField.fill(firstName);

        // Last name field interactions
        await lastNameField.tap();
        await lastNameField.fill(' ');
        await device.driver.pressButton('BACK'); // Dismiss any autofill suggestions
        await lastNameField.fill(lastName);

        await attachStepScreenshot(screen, testInfo, '03-name-filled');
    });

    await test.step(`Fill in phone number: ${phoneNumber}`, async () => {
        await screen.swipe('up', { distance: 500, duration: 500 });
        await new Promise(resolve => setTimeout(resolve, 200));

        const phoneField = await firstVisible([
            screen.getByText('Phone (Mobile)'),
            screen.getByText('+1'),
        ], 10_000);

        await phoneField.tap();

        await device.driver.pressButton('DPAD_RIGHT');
        await device.driver.pressButton('DPAD_RIGHT');
        
        await device.driver.typeText(phoneDigits);

        await attachStepScreenshot(screen, testInfo, '04-phone-filled');
    });

    await test.step('Save the contact', async () => {
        // Use the Save button found in the window dump
        const saveButton = screen.getByText('Save');

        await saveButton.tap();
        await attachStepScreenshot(screen, testInfo, '05-contact-saved');
    });

    await test.step('Verify contact was added', async () => {
        // Wait a bit for the contact list to refresh
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Contacts opens the saved contact detail page on this build.
        const contactInList = await firstVisible([
            screen.getByText(contactName),
            screen.getByLabel(contactName),
            screen.getByText(new RegExp(`${contactName.replace(' ', '\\s*')}.*${phoneDigits}`)),
            screen.getByText(new RegExp(contactName.replace(' ', '\\s*'))),
        ], 5_000).catch(() => null);

        if (!contactInList) {
            throw new Error(`Contact "${contactName}" not found after save`);
        }

        await expect(contactInList).toBeVisible();
        await attachStepScreenshot(screen, testInfo, '06-contact-verified');
    });
});
