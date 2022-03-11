import { DeleteAdapter } from '../../adapter/domain/DeleteAdapter';
import { DeleteEntityInteractor } from './DeleteEntityInteractor';

interface CommandTest {
  fooValue: unknown;
}

describe(DeleteEntityInteractor.name, () => {
  let deleteAdapterMock: jest.Mocked<DeleteAdapter<CommandTest>>;
  let deleteEntityInteractor: DeleteEntityInteractor<CommandTest>;

  beforeAll(() => {
    deleteAdapterMock = {
      delete: jest.fn(),
    } as Partial<jest.Mocked<DeleteAdapter<CommandTest>>> as jest.Mocked<
      DeleteAdapter<CommandTest>
    >;
    deleteEntityInteractor = new DeleteEntityInteractor(deleteAdapterMock);
  });

  describe('.interact()', () => {
    describe('when called', () => {
      let commandFixture: CommandTest;

      beforeAll(async () => {
        commandFixture = { fooValue: 'bar' };

        await deleteEntityInteractor.interact(commandFixture);
      });
      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call deleteAdapter.delete()', () => {
        expect(deleteAdapterMock.delete).toHaveBeenCalledTimes(1);
        expect(deleteAdapterMock.delete).toHaveBeenCalledWith(commandFixture);
      });
    });
  });
});
