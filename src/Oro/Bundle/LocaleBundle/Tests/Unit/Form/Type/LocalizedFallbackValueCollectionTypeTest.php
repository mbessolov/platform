<?php

namespace Oro\Bundle\LocaleBundle\Tests\Unit\Form\Type;

use Doctrine\Common\Persistence\ManagerRegistry;
use Oro\Bundle\LocaleBundle\Form\DataTransformer\LocalizedFallbackValueCollectionTransformer;
use Oro\Bundle\LocaleBundle\Form\Type\LocalizedFallbackValueCollectionType;
use Oro\Bundle\LocaleBundle\Form\Type\LocalizedPropertyType;

class LocalizedFallbackValueCollectionTypeTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @var \PHPUnit_Framework_MockObject_MockObject|ManagerRegistry
     */
    protected $registry;

    /**
     * @var LocalizedFallbackValueCollectionType
     */
    protected $type;

    protected function setUp()
    {
        $this->registry = $this->createMock('Doctrine\Common\Persistence\ManagerRegistry');
        $this->type = new LocalizedFallbackValueCollectionType($this->registry);
    }

    public function testGetName()
    {
        $this->assertEquals(LocalizedFallbackValueCollectionType::NAME, $this->type->getName());
    }

    public function testSetDefaults()
    {
        $expectedOptions = [
            'field' => 'string',
            'entry_type' => 'text',
            'entry_options' => [],
        ];

        $resolver = $this->createMock('Symfony\Component\OptionsResolver\OptionsResolver');
        $resolver->expects($this->once())
            ->method('setDefaults')
            ->with($expectedOptions);

        $this->type->configureOptions($resolver);
    }

    public function testBuildForm()
    {
        $type = 'form_text';
        $options = ['key' => 'value'];
        $field = 'text';

        $builder = $this->createMock('Symfony\Component\Form\FormBuilderInterface');
        $builder->expects($this->at(0))
            ->method('add')
            ->with(
                LocalizedFallbackValueCollectionType::FIELD_VALUES,
                LocalizedPropertyType::NAME,
                ['entry_type' => $type, 'entry_options' => $options]
            )->willReturnSelf();
        $builder->expects($this->at(1))
            ->method('add')
            ->with(
                LocalizedFallbackValueCollectionType::FIELD_IDS,
                'collection',
                ['entry_type' => 'hidden']
            )->willReturnSelf();
        $builder->expects($this->once())
            ->method('addViewTransformer')
            ->with(new LocalizedFallbackValueCollectionTransformer($this->registry, $field))
            ->willReturnSelf();

        $this->type->buildForm(
            $builder,
            ['entry_type' => $type, 'entry_options' => $options, 'field' => $field]
        );
    }
}
