import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationValidation } from './operation-validation';

describe('OperationValidation', () => {
  let component: OperationValidation;
  let fixture: ComponentFixture<OperationValidation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationValidation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperationValidation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
