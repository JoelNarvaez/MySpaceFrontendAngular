import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBloqueos } from './admin-bloqueos';

describe('AdminBloqueos', () => {
  let component: AdminBloqueos;
  let fixture: ComponentFixture<AdminBloqueos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminBloqueos],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminBloqueos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
