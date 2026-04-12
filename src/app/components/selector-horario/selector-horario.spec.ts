import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectorHorario } from './selector-horario';

describe('SelectorHorario', () => {
  let component: SelectorHorario;
  let fixture: ComponentFixture<SelectorHorario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectorHorario],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectorHorario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
