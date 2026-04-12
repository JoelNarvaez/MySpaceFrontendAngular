import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCalendario } from './admin-calendario';

describe('AdminCalendario', () => {
  let component: AdminCalendario;
  let fixture: ComponentFixture<AdminCalendario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCalendario],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminCalendario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
