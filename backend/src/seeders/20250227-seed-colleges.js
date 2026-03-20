export const up = async (queryInterface, Sequelize) => {
  await queryInterface.bulkInsert('colleges', [
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        name: 'Stanford University',
        url: 'https://www.stanford.edu',
        financial_aid_url: 'https://admission.stanford.edu/admit/scea-rd/',
        state: 'CA',
        type: 'Private',
        form_selector_data: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        name: 'MIT',
        url: 'https://web.mit.edu',
        financial_aid_url: 'https://web.mit.edu/admissions/',
        state: 'MA',
        type: 'Private',
        form_selector_data: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        name: 'UC Berkeley',
        url: 'https://www.berkeley.edu',
        financial_aid_url: 'https://financialaid.berkeley.edu/',
        state: 'CA',
        type: 'Public',
        form_selector_data: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        name: 'Harvard University',
        url: 'https://www.harvard.edu',
        financial_aid_url: 'https://college.harvard.edu/admissions-aid/financial-aid',
        state: 'MA',
        type: 'Private',
        form_selector_data: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        name: 'Yale University',
        url: 'https://www.yale.edu',
        financial_aid_url: 'https://admissions.yale.edu/financial-aid',
        state: 'CT',
        type: 'Private',
        form_selector_data: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        name: 'University of Texas at Austin',
        url: 'https://www.utexas.edu',
        financial_aid_url: 'https://financialaid.utexas.edu/',
        state: 'TX',
        type: 'Public',
        form_selector_data: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.bulkDelete('colleges', null, {});
};
