import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationDetails } from './operation-details';

describe('OperationDetails', () => {
  let component: OperationDetails;
  let fixture: ComponentFixture<OperationDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperationDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
